const users = []

//addUser , removeUser , getUser ,getUserRoom

const addUser = ({id,username,room}) => {

    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if(!username || !room)
    {
        return {
            error : 'Username and room are required'
        }
    }

        //chech existing User
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })
    //Validate user 
    if(existingUser){
        return {
            error : 'User name is in use!!'
        }
    }

    // Store User
    const user = {id , username, room} 
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id )
    if(index !== -1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom  = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room ===room)

}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}