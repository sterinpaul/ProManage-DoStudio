import authRoutes from './authRoutes.js'
import adminRoutes from './adminRoutes.js'
import userRoutes from './userRoutes.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import subTaskRoutes from './subTaskRoutes.js';
import chatRoutes from './chatRoutes.js';


const routes = (app)=>{
    app.use('/api/auth',authRoutes());
    app.use('/api/admin',authMiddleware,adminRoutes());
    app.use('/api/user',authMiddleware,userRoutes());
    app.use('/api/projects',authMiddleware,projectRoutes());
    app.use('/api/tasks',authMiddleware,taskRoutes());
    app.use('/api/subTasks',authMiddleware,subTaskRoutes());
    app.use('/api/chat',authMiddleware,chatRoutes());
}

export default routes