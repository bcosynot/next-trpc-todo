import { authedProcedure, publicProcedure, router } from '../trpc';
import { prisma } from '../../common/prisma';
import { z } from 'zod';
import { Task } from '@prisma/client';
import EventEmitter from 'events';
import { observable } from '@trpc/server/observable';
import { TRPCError } from '@trpc/server';

interface TaskEvents {
  added: (data: Task) => void;
  updated: (data: Task) => void;
  deleted: (id: string) => void;
}

// This is a simple in-memory event emitter
declare interface TaskEventEmitter {
  on<E extends keyof TaskEvents>(event: E, listener: TaskEvents[E]): this;
  emit<E extends keyof TaskEvents>(event: E, data: Parameters<TaskEvents[E]>[0]): boolean;
}

class TaskEventEmitter extends EventEmitter {}
const taskEventEmitter = new TaskEventEmitter();

export const tasksRouter = router({
  list: authedProcedure
    .input(
      z.object({
        cursor: z.date().nullish(),
        take: z.number().min(1).max(50).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      const take = input.take ?? 10;
      const cursor = input.cursor;
      const page = await prisma.task.findMany({
        where: { creatorId: user.id },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor ? { createdAt: cursor } : undefined,
        take: take + 1,
        skip: 0,
      });
      const items = page.reverse();
      let nextCursor: typeof cursor | null = null;
      if (items.length > take) {
        const prev = items.shift();
        nextCursor = prev!.createdAt;
      }
      return {
        items,
        nextCursor,
      };
    }),
  createTask: authedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ctx, input }) => {
      const newTask = await prisma.task.create({
        data: {
          ...input,
          creatorId: ctx.user.id,
        },
      });
      // Publish the new task to the subscription
      taskEventEmitter.emit('added', newTask);
      return newTask;
    }),
  toggleDone: authedProcedure
    .input(
      z.object({
        id: z.string()
    })
  ).mutation( async ({input}) => {
    const taskToUpdate = await prisma.task.findFirst({
      where: {
        id: input.id
      }});
    if (!taskToUpdate) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task does not exist'
      })
    }
    if (taskToUpdate.done) {
      taskToUpdate.done = false;
      taskToUpdate.doneAt = null;
    } else {
      taskToUpdate.done = true;
      taskToUpdate.doneAt = new Date()
    }
    const updatedTask = await prisma.task.update({
      where: { id: input.id },
      data: taskToUpdate
    })
    // Publish the updated task to the subscription
    taskEventEmitter.emit('updated', updatedTask);
    return updatedTask
   }),
  updateTask: authedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        assignedToId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatedTask = await prisma.task.update({
        where: { id: input.id },
        data: input,
      });
      // Publish the updated task to the subscription
      taskEventEmitter.emit('updated', updatedTask);
      return updatedTask;
    }),
  deleteTask: authedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await prisma.task.delete({
        where: { id: input },
      });
      // Publish the deleted task to the subscription
      taskEventEmitter.emit('deleted', input);
      return true;
    }),
  newTasksSubscription: publicProcedure
    .subscription(() => {
      return observable<Task>((observer) => {
        taskEventEmitter.on('added', (data) => {
          observer.next(data);
        });
        return () => {
          taskEventEmitter.removeAllListeners('added');
        };
      });
    }),
  updatedTasksSubscription: publicProcedure
    .subscription(() => {
      return observable<Task>((observer) => {
        taskEventEmitter.on('updated', (data) => {
          observer.next(data);
        });
        return () => {
          taskEventEmitter.removeAllListeners('updated');
        };
      });
    }),
  deletedTasksSubscription: publicProcedure
    .subscription(() => {
      return observable<string>((observer) => {
        taskEventEmitter.on('deleted', (data) => {
          observer.next(data);
        });
        return () => {
          taskEventEmitter.removeAllListeners('deleted');
        };
      });
    }),
});
