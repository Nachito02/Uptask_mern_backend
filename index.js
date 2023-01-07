import  express from "express";
import conectarDB from "./config/db.js";
import dotenv from "dotenv";
import cors from 'cors'
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";


const app = express();

app.use(express.json());

dotenv.config();
conectarDB();

//configurar cors
const whiteList = [process.env.FRONTEND_URL];
 
const corsOptions= {
    origin: function (origin, callback){
        if(whiteList.includes(origin)){
            
            callback(null, true) //dándole acceso a la API
            
        }else{
            callback(new Error("Error de cors"))
        }
    }
}

app.use(cors(corsOptions))

// Routing 

app.use('/api/usuarios',usuarioRoutes )

app.use('/api/proyectos',proyectoRoutes )
app.use('/api/tareas',tareaRoutes )







const PORT = process.env.PORT || 4000;




const servidor = app.listen(PORT, () =>{
    console.log(`servidor corriendo en el puerto ${PORT} `);
})


// socket.io

import {Server} from 'socket.io';

const io = new Server(servidor,{
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
});

io.on('connection',(socket) => {
    console.log('conectando a socket io')

    // definir los eventos de socket.io

   socket.on('abrir proyecto', (proyecto) => {
    socket.join(proyecto);

   });


   socket.on('nueva tarea', tarea => {
    socket.to(tarea.proyecto).emit('tarea agregada', tarea)
   }) 


   socket.on('eliminar tarea',  tarea => {
    socket.to(tarea.proyecto).emit('tarea eliminada', tarea)
   })

   socket.on('actualizar tarea',(tarea) => {
    socket.to(tarea.proyecto._id).emit('tarea actualizada',tarea);
   })

   socket.on('cambiar estado', tarea => {
    socket.to(tarea.proyecto._id).emit('nuevo estado',tarea)
   })
})