import {TasksStateType} from '../App';
import {v1} from 'uuid';
import {AddTodolistActionType, fetchTodolist, fetchTodolistType, RemoveTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    task: TaskType
}

export type ChangeTaskActionType = {
    type: 'CHANGE-TASK',
    task: TaskType
}

export type fetchTasksACType = ReturnType<typeof fetchTasksAC>
type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | fetchTodolistType
    | fetchTasksACType

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "SET-TODOLIST": {
            const stateCopy = {...state}
            action.todolists.forEach(el => {
                stateCopy[el.id] = []
            })
            return stateCopy
        }
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            return {
                ...state,
                [action.task.todoListId]: [{...action.task}, ...state[action.task.todoListId]]
            }
        }
        case 'CHANGE-TASK': {
          return {
              ...state,
              [action.task.todoListId]:[...state[action.task.todoListId].map(t => t.id === action.task.id ? {...action.task}:t)]
          }
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolistId]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        case "SET-TASKS": {
            return {...state, [action.todolistId]: [...action.tasks]}
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: 'ADD-TASK', task}
}
export const changeTaskAC = (task: TaskType):ChangeTaskActionType  => {
    return {type: 'CHANGE-TASK', task}
}

export const fetchTasksAC = (tasks: TaskType[], todolistId: string) => {
    return {type: 'SET-TASKS', tasks, todolistId} as const
}


export const fetchTasksThunkCreator = (todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.getTasks(todolistId)
        .then(response => {
            console.log(response.data.items)
            dispatch(fetchTasksAC(response.data.items, todolistId))
        })
}

export const deleteTasksThunkCreator = (todolistId: string, taskId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(response => {
            dispatch(removeTaskAC(taskId, todolistId))
        })
}

type updateTaskType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

export const updateTasksThunkCreator = (value: updateTaskType, taskId: string, todolistId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistId].find(t => t.id === taskId)
    if (task) {
        const model: UpdateTaskModelType = {
            ...task,
            ...value
        }

        todolistsAPI.updateTask(todolistId, taskId, model)
            .then(response => {
                dispatch(changeTaskAC(response.data.data.item))
            })
    }
}
export const createTasksThunkCreator = (todolistId: string, title: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTask(todolistId, title)
        .then(response => {
            dispatch(addTaskAC(response.data.data.item))
        })
}
