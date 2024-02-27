import Navbar from 'components/Navbar';
import { NextPage } from 'next';
import { requireAuth } from '../common/requireAuth';
import NewTaskBox from '../components/tasks/newTaskBox';
import TasksList from '../components/tasks/tasksList';

export const getServerSideProps = requireAuth(async () => {
  return { props: {} };
});

const Dashboard: NextPage = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-5">
        <NewTaskBox />
        <TasksList />
      </main>
    </>
  );
};

export default Dashboard;
