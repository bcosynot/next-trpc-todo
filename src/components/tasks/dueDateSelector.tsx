import { Task } from '@prisma/client';
import { trpc } from '../../utils/trpc';
import { useCallback, useState } from 'react';

export function DueDateSelector(props: Readonly<{ task: Task }>) {
  const { task } = props;
  const taskUpdateMutation = trpc.tasks.updateTask.useMutation().mutateAsync;

  const [month, setMonth] = useState(task.dueDate ? task.dueDate.getMonth() + 1 : -99);
  const [date, setDate] = useState(task.dueDate ? task.dueDate.getDate() : -99);
  const [year, setYear] = useState(task.dueDate ? task.dueDate.getFullYear() : -99);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const updateDueDate = useCallback(async () => {
    if (month === -99 || date === -99 || year === -99) {
      return;
    }
    const newDueDate = new Date(year, month - 1, date);
    await taskUpdateMutation({
      id: task.id,
      dueDate: newDueDate,
    });
    setDueDate(newDueDate);
  }, [month, date, year, taskUpdateMutation, task]);

  return (<details className="dropdown">
    <summary className="btn btn-outline btn-sm btn-circle">
      <div className="tooltip"
           data-tip={dueDate ? `Due ${dueDate.getMonth() + 1}/${dueDate.getDate()}/${dueDate.getFullYear()}` : 'Add due date'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clipRule="evenodd" />
        </svg>
      </div>
    </summary>
    <form onSubmit={(e) => {
      e.preventDefault();
      updateDueDate().catch(console.error);
    }}>
      <div className="mt-1">
        <select className="select select-sm" defaultValue={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          <option disabled value="-99">Month</option>
          <option value="1">Jan</option>
          <option value="2">Feb</option>
          <option value="3">Mar</option>

          <option value="4">Apr</option>
          <option value="5">May</option>
          <option value="6">Jun</option>
          <option value="7">Jul</option>
          <option value="8">Aug</option>
          <option value="9">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
        <select className="select select-sm" defaultValue={date} onChange={(e) => setDate(parseInt(e.target.value))}>
          <option disabled value="-99">Date</option>
          {Array.from({ length: 31 }, (_, k) => k + 1).map((date) => <option value={date} key={date}>{date}</option>)}
        </select>
        <select className="select select-sm" defaultValue={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          <option disabled value="-99">Year</option>
          {Array.from({ length: 10 }, (_, k) => 2024 + k + 1).map((year) => <option value={year}
                                                                                    key={year}>{year}</option>)}
        </select>
        <button type="submit" className="btn btn-outline btn-sm">
          Save
        </button>
      </div>
    </form>
  </details>);
}
