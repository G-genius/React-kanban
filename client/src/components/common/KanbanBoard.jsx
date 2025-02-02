import {Box, Typography, Divider, TextField, IconButton, Card} from '@mui/material'
import {useEffect, useState} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import taskApi from '../../api/taskApi'
import TaskModal from './TaskModal'
import '../../css/Main.css';
import '../../css/Card.css'


const Kanban = props => {
    const boardId = props.boardId
    const [data, setData] = useState([])
    const [quickly, setQuickly] = useState(false)
    const [selectedTask, setSelectedTask] = useState(undefined)


    useEffect(() => {
        setData(props.data)
        setQuickly(props.quickly)
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
            setSelectedTask(task)
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



    /*const onChangeCheckBox = () => {
    let status = document.querySelectorAll('chBox')
         if (isChecked.checked == true) {
        
          }
        document.getElementById('board-section').style.background = "red"
        console.log(status.value)
     }
    onChangeCheckBox()*/

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
                    marginTop: '51px'
                }}>
                    {
                        data.map(section => (

                            <div key={section.id} style={{width: '600px'}}>

                                <Droppable key={section.id} droppableId={section.id}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            sx={{
                                                width: '560px',
                                                padding: '10px',
                                                marginRight: '30px',
                                                background: "#D9D9D9",
                                                minHeight: "584px"
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px',
                                                fontWeight: "bold"
                                            }}>
                                                <a>{section.title}</a>
                                                <IconButton
                                                    variant='outlined'
                                                    size='small'
                                                    sx={{
                                                        display: 'flex',
                                                        '&:hover': {color: 'green'}
                                                    }}
                                                    onClick={() => createTask(section.id)}
                                                >
                                                    <AddOutlinedIcon/>
                                                </IconButton>
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
                                                                className="card-item"
                                                                onClick={() => setSelectedTask(task)}
                                                            >

                                                                <Typography>
                                                                    <div className="board">
                                                                        <div className="board-section"
                                                                             id="board-section">
                                                                            <div className='board_header'>
                                                                                <a className="board-title">Автор: {task.author}</a>
                                                                                <a className="board-title">{task.date}</a>
                                                                            </div>
                                                                            <div>
                                                                                <a className="board-title">Клиент: {task.client}</a>
                                                                            </div>
                                                                            <div className="board_table_column">
                                                                                <a className="board_column">Наименование
                                                                                    <a className="board-text">{task.name}</a>
                                                                                    <a className="board-text">{task.name2}</a>
                                                                                    <a className="board-text">{task.name3}</a>
                                                                                </a>
                                                                                <a className="board_column">Марка
                                                                                    <a className="board-text">{task.mark}</a>
                                                                                    <a className="board-text">{task.mark2}</a>
                                                                                    <a className="board-text">{task.mark3}</a>
                                                                                </a>
                                                                                <a className="board_column">ШхД заг
                                                                                    <a className="board-text">{task.width} {task.height}</a>
                                                                                    <a className="board-text">{task.width2} {task.height2}</a>
                                                                                    <a className="board-text">{task.width3} {task.height3}</a>
                                                                                </a>

                                                                                <a className="board_column">Кол-во
                                                                                    <a className="board-text">{task.count}</a>
                                                                                    <a className="board-text">{task.count2}</a>
                                                                                    <a className="board-text">{task.count3}</a>

                                                                                </a>
                                                                                <a className="board_column">Чертёж
                                                                                    <a className="board-text">{task.planName}</a>
                                                                                    <a className="board-text">{task.planName2}</a>
                                                                                    <a className="board-text">{task.planName3}</a>
                                                                                </a>


                                                                            </div>
                                                                            <div className='podval'>
                                                                                <a className="board-text"
                                                                                   ><input
                                                                                    id="chBox"
                                                                                    type="checkbox"
                                                                                    value={task.quickly}
                                                                                    checked={task.quickly}
                                                                                    className="board-title"/>Срочно</a>
                                                                                <button className='redactir'
                                                                                        onClick={() => setSelectedTask(task)
                                                                                }>Редактировать
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Typography>

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