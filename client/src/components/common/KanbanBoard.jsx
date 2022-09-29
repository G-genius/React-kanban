import {Box, Typography, Divider, TextField, IconButton, Card} from '@mui/material'
import {useEffect, useState} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import sectionApi from '../../api/sectionApi'
import taskApi from '../../api/taskApi'
import TaskModal from './TaskModal'
import '../../css/Main.css';


const Kanban = props => {
    const boardId = props.boardId
    const [data, setData] = useState([])
    const [selectedTask, setSelectedTask] = useState(undefined)

    useEffect(() => {
        setData(props.data)
    }, [props.data])

    const onDragEnd = async ({source, destination}) => {
        if (!destination) return
        const sourceColIndex = data.findIndex(e => e.id === source.droppableId)
        const destinationColIndex = data.findIndex(e => e.id === destination.droppableId)
        const sourceCol = data[sourceColIndex]
        const destinationCol = data[destinationColIndex]

        const sourceSectionId = sourceCol.id
        const destinationSectionId = destinationCol.id

        const sourceTasks = [...sourceCol.tasks]
        const destinationTasks = [...destinationCol.tasks]

        if (source.droppableId !== destination.droppableId) {
            const [removed] = sourceTasks.splice(source.index, 1)
            destinationTasks.splice(destination.index, 0, removed)
            data[sourceColIndex].tasks = sourceTasks
            data[destinationColIndex].tasks = destinationTasks
        } else {
            const [removed] = destinationTasks.splice(source.index, 1)
            destinationTasks.splice(destination.index, 0, removed)
            data[destinationColIndex].tasks = destinationTasks
        }

        try {
            await taskApi.updatePosition(boardId, {
                resourceList: sourceTasks,
                destinationList: destinationTasks,
                resourceSectionId: sourceSectionId,
                destinationSectionId: destinationSectionId
            })
            setData(data)
        } catch (err) {
            alert(err)
        }
    }

    const createTask = async (sectionId) => {
        try {
            const task = await taskApi.create(boardId, {sectionId})
            const newData = [...data]
            const index = newData.findIndex(e => e.id === sectionId)
            newData[index].tasks.unshift(task)
            setData(newData)
        } catch (err) {
            alert(err)
        }
    }

    const onUpdateTask = (task) => {
        const newData = [...data]
        const sectionIndex = newData.findIndex(e => e.id === task.section.id)
        const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
        newData[sectionIndex].tasks[taskIndex] = task
        setData(newData)
    }

    const onDeleteTask = (task) => {
        const newData = [...data]
        const sectionIndex = newData.findIndex(e => e.id === task.section.id)
        const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
        newData[sectionIndex].tasks.splice(taskIndex, 1)
        setData(newData)
    }



    return (
        <div className="kanban-board">
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>

            </Box>
            <Divider sx={{margin: '10px 0'}}/>
            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    overflowX: 'auto',
                    marginTop: '50px'
                }}>
                    {
                        data.map(section => (
                            <div key={section.id} style={{width: '600px'}}>
                                <Droppable key={section.id} droppableId={section.id}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            sx={{width: '560px', padding: '10px', marginRight: '30px', background: "#D9D9D9", minHeight: "584px"}}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px',
                                                fontWeight: "bold"
                                            }}>
                                                <a>{section.title}</a>
                                            </Box>
                                            {/* tasks */}
                                            {
                                                section.tasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <Typography>
                                                                    <div className="board">
                                                                        <div className="board-section">
                                                                            <div className='board_header'>
                                                                                <a className="board-title">Автор: {task.author}<a
                                                                                    className="board-text">{}</a></a>
                                                                                <a className="board-title">{task.date}<a
                                                                                    className="board-text">{}</a></a>
                                                                            </div>
                                                                            <div>
                                                                                <a className="board-title">Клиент: {task.client}<a
                                                                                    className="board-text">{}</a></a>
                                                                            </div>
                                                                            <div className="board_table_column">
                                                                                <a className="board_column">Наименование {task.name}</a>
                                                                                <a className="board_column">Марка {task.mark}</a>
                                                                                <a className="board_column">Ширина {task.width}</a>
                                                                                <a className="board_column">Длина {task.height}</a>
                                                                                <a className="board_column">Кол-во {task.count}</a>
                                                                                <a className="board_column">Чертёж {task.plan}</a>
                                                                            </div>
                                                                            <div className='podval'>
                                                                                <a className="board-text" id="checkbox-quickly"><input
                                                                                    type="checkbox"
                                                                                    value={task.quickly}
                                                                                    className="board-title"/> Срочно</a>
                                                                                <button className='redactir'
                                                                                        onClick={() => setSelectedTask(task)}>Редактировать
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Typography>
                                                                <IconButton
                                                                    variant='outlined'
                                                                    size='small'
                                                                    sx={{
                                                                        display: 'flex',
                                                                        margin: '0 auto',
                                                                        '&:hover': {color: 'green'}
                                                                    }}
                                                                    onClick={() => createTask(section.id)}
                                                                >
                                                                    <AddOutlinedIcon/>
                                                                </IconButton>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))
                                            }
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </div>
                        ))
                    }
                </Box>
            </DragDropContext>
            <TaskModal
                task={selectedTask}
                boardId={boardId}
                onClose={() => setSelectedTask(undefined)}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
            />
        </div>
    )
}

export default Kanban