import { trpc } from '../../utils/trpc';
import React, { useRef, useState } from 'react';

/**
 * A new task box that allows the user to add a new task to the list
 */
export const NewTaskBox = () => {
  const titleElement = useRef(null)
  const addTaskMutation = trpc.tasks.createTask.useMutation();
  const [title, setTitle] = useState('');
  const addTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) {
      return;
    }
    addTaskMutation.mutate({
      title,
    });
    // @ts-expect-error assigned to an input element
    titleElement.current.value = ''
  };
  return (
    <div className="flex items-center justify-center w-full mt-5">
      <form onSubmit={addTask}>
        <div className="join">
          <input
            className="input input-lg input-bordered join-item"
            placeholder="New task..."
            onChange={(e) => setTitle(e.target.value)}
            ref={titleElement}
          />
          <button type="submit" className="btn btn-lg btn-square join-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTaskBox;
