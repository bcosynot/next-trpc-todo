import { useCallback, useEffect, useRef, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Task } from '@prisma/client';
import { DueDateSelector } from './dueDateSelector';
import { AssigneeSelector } from './assigneeSelector';

const TasksList = () => {
  const tasksQuery = trpc.tasks.list.useInfiniteQuery(
    {},
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    },
  );
  const utils = trpc.useUtils();

  const [tasks, setTasks] = useState(() => {
    if (tasksQuery.data == null) {
      console.log('no tasks in initial state');
      return [];
    }
    return tasksQuery.data?.pages.map((page) => page.items).flat();
  });

  const addTasks = useCallback((incoming?: Task[]) => {
    setTasks((current) => {
      const map: Record<Task['id'], Task> = {};
      for (const task of current ?? []) {
        map[task.id] = task;
      }
      for (const task of incoming ?? []) {
        map[task.id] = task;
      }
      return Object.values(map).sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    });
  }, []);

  useEffect(() => {
    if (!tasksQuery.data?.pages || tasksQuery.data?.pages.length === 0) {
      tasksQuery.fetchNextPage().catch(console.error);
    }
  }, [tasksQuery]);

  useEffect(() => {
    if (!tasksQuery.data?.pages) {
      return;
    }
    const tasks = tasksQuery.data?.pages.map((page) => page.items).flat();
    addTasks(tasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksQuery.data?.pages]);

  // subscribe to new tasks being added
  trpc.tasks.newTasksSubscription.useSubscription(undefined, {
    onData(task) {
      console.log('new task', task);
      addTasks([task]);
    },
    onError(err) {
      console.error(err);
      utils.tasks.list.invalidate();
    },
  });
  trpc.tasks.updatedTasksSubscription.useSubscription(undefined, {
    onData(task) {
      console.log('updated task', task);
      addTasks([task]);
    },
    onError(err) {
      console.error(err);
      utils.tasks.list.invalidate();
    },
  });

  const markDoneMutation = trpc.tasks.toggleDone.useMutation().mutateAsync;

  const toggleDone = useCallback(async (id: string) => {
    const result = await markDoneMutation({ id });
    if (result) {
      addTasks([result]);
    }
  }, [addTasks, markDoneMutation]);

  const listInnerRef = useRef<HTMLDivElement>(null);


  return (
    <div className="grid grod-cols-1 gap-4 w-9/12 mt-5 mx-auto" ref={listInnerRef}>
      {tasks.map((task) => (
        <div className="card card-compact bg-base-100 shadow-sm" key={task.id}>
          <div className="card-body">
            <div className="flex flex-row">
              <div className="basis-2/3 flex flex-row">
                <input type="checkbox" className="checkbox" defaultChecked={task.done}
                       onChange={() => toggleDone(task.id)} />
                <h4 className="mx-2 my-0">{task.title}</h4>
              </div>
              <p>{task.description}</p>
              <div className="basis-1/3 flex flex-row">
                <DueDateSelector task={task} />
                <AssigneeSelector task={task} />
              </div>
            </div>
          </div>
        </div>
      ))}
      <button
        className="btn btn-primary"
        disabled={tasksQuery.isFetchingNextPage || !tasksQuery.hasNextPage}
        onClick={() => {
          tasksQuery.fetchNextPage().catch(console.error);
        }}
      >
        Load more
      </button>
    </div>
  );
};

export default TasksList;
