import { Box, Typography, Divider, TextField, IconButton, Card } from '@mui/material'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import sectionApi from '../../api/sectionApi'
import taskApi from '../../api/taskApi'
import TaskModal from './TaskModal'
import '../../css/Main.css';
let timer
const timeout = 500

const Kanban = props => {
    const boardId = props.boardId
    const [data, setData] = useState([])
    const [selectedTask, setSelectedTask] = useState(undefined)

    useEffect(() => {
        setData(props.data)
    }, [props.data])

    const onDragEnd = async ({ source, destination }) => {
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

    const createSection = async () => {
        try {
            const section = await sectionApi.create(boardId)
            setData([...data, section])
        } catch (err) {
            alert(err)
        }
    }

    const deleteSection = async (sectionId) => {
        try {
            await sectionApi.delete(boardId, sectionId)
            const newData = [...data].filter(e => e.id !== sectionId)
            setData(newData)
        } catch (err) {
            alert(err)
        }
    }

    const updateSectionTitle = async (e, sectionId) => {
        clearTimeout(timer)
        const newTitle = e.target.value
        const newData = [...data]
        const index = newData.findIndex(e => e.id === sectionId)
        newData[index].title = newTitle
        setData(newData)
        timer = setTimeout(async () => {
            try {
                await sectionApi.update(boardId, sectionId, { title: newTitle })
            } catch (err) {
                alert(err)
            }
        }, timeout);
    }

    const createTask = async (sectionId) => {
        try {
            const task = await taskApi.create(boardId, { sectionId })
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
        <>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>

            </Box>
            <Divider sx={{ margin: '10px 0' }} />
            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    overflowX: 'auto'
                }}>
                    {
                        data.map(section => (
                            <div key={section.id} style={{ width: '650px' }}>
                                <Droppable key={section.id} droppableId={section.id}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            sx={{ width: '620px', padding: '10px', marginRight: '30px' }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '10px'
                                            }}>
                                                <TextField
                                                    value={section.title}
                                                    onChange={(e) => updateSectionTitle(e, section.id)}
                                                    placeholder='Untitled'
                                                    variant='outlined'
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                                                        '& .MuiOutlinedInput-root': { fontSize: '1rem', fontWeight: '700' }
                                                    }}
                                                />
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

                                                                onClick={() => setSelectedTask(task)}
                                                            >

                                                                
                                                                <Typography>
                                                                    <div className="board">
                                                                        <div className="board-section">
                                                                            <div className='board_header'>
                                                                            <a className="board-title">Автор: {task.author}<a className="board-text">{}</a></a>
                                                                            <a className="board-title">{task.date}<a className="board-text">{}</a></a>
                                                                            </div>
                                                                            <div>
                                                                            <a className="board-title">Клиент: {task.client}<a className="board-text">{}</a></a>
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
                                                                                <a className="board-text"><input type="checkbox" className="board-title"/> Срочно</a>
                                                                                <button className='redactir' onClick={onUpdateTask}>Редактировать</button>
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
                                                                    '&:hover': { color: 'green' }
                                                                    }}
                                                                    onClick={() => createTask(section.id)}
                                                                >
                                                    <AddOutlinedIcon />
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
        </>
    )
}

export default Kanban