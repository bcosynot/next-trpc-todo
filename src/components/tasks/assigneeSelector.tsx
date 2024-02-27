import { Task, User } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';

export function AssigneeSelector(props: Readonly<{ task: Task }>) {
  const [assignedTo, setAssignedTo] = useState<User | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const userByIdQuery = trpc.users.byId.useQuery(props.task.assignedToId ? props.task.assignedToId : '');
  // The following query gets all users. Ideally, we would have a team concept and only show users in the same team.
  const listUsersQuery = trpc.users.list.useQuery(null);
  useEffect(() => {
    if (props.task.assignedToId) {
      if (userByIdQuery.data) {
        setAssignedTo(userByIdQuery.data);
      }
    }
  }, [props.task.assignedToId, userByIdQuery.data]);
  useEffect(() => {
    if (listUsersQuery.data) {
      setAssignableUsers(listUsersQuery.data);
    }
  }, [listUsersQuery.data]);
  const updateTaskMutation = trpc.tasks.updateTask.useMutation().mutateAsync;
  const assignTask = useCallback(async (userId: string) => {
    await updateTaskMutation({
      id: props.task.id,
      assignedToId: userId,
    });
    const user = assignableUsers.find((user) => user.id === userId);
    if (user) {
      setAssignedTo(user);
    }
  }, [assignableUsers, props.task.id, updateTaskMutation]);
  return (
    <details className="dropdown ml-1">
      <summary className="btn btn-neutral btn-circle btn-sm">
        <div className="tooltip"
             data-tip={assignedTo ? `Assigned to ${assignedTo.username}` : 'Assign to someone'}>
          {assignedTo ? assignedTo.username[0] : '?'}
        </div>
      </summary>
      <div className="mt-1">
        <select className="select select-sm" defaultValue={props.task.assignedToId ?? '-99'}
                onChange={(e) => {
                  assignTask(e.target.value).catch(console.error);
                }}>
          <option disabled value="-99">Assign to</option>
          {assignableUsers.map((user) => {
            return <option value={user.id} key={user.id}>{user.username}</option>;
          })}
        </select>
      </div>
    </details>
  );
}
