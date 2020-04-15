const io = require('socket.io')
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton =$messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templets
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#Location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML 
//Options

const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })
    const autoscroll = () =>{
            //New message element
        const $newMessage = $messages.lastElementChild

            //New message height
        const newMessageStyle = getComputedStyle($newMessage)
        const newMessageMargin = parseInt(newMessageStyle.marginBottom)
        const newMessageHeight = $newMessage.offsetHeight  + newMessageMargin
        
        //visible height
        const visibleHeight = $messages.offsetHeight

        //height of message container
        const containerHeight =  $messages.scrollHeight
        
        //How far have i scrolled
        const scrollOffset =  $messages.scrollTop + visibleHeight

        if(containerHeight - newMessageHeight <=  scrollOffset){
            $messages.scrollTop =  $messages.scrollHeight
        }
    }

 //----------------message----------------------   
 
    var socket = io.connect('http://localhost:3000')
    socket.on('message', (message) =>{
        console.log(message)
        const html = Mustache.render(messageTemplate,{
            username:message.username,
            message:message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    })



 //--------location------------------   
    socket.on('loctionMessage', (message) =>{
        console.log(message)
        const html = Mustache.render(locationMessageTemplate,{
            username:message.username,
            url : message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    })


// ------------Rendering User--------------
    socket.on('roomData' , ({room ,users}) =>{
         const html = Mustache.render(sidebarTemplate,{
               room,
               users
        })
        document.querySelector('#sidebar').innerHTML = html
    })
//server(emit) -> client(receive) --acknowledgment --> server
//client(emit) -> server(receive) --acknowledgment --> client
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.Message.value // same as query selector e.target.elements.{input_attribute_name}.value or .{any attribute name}
        socket.emit('sendMessgae', message ,(error) =>{
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()
            if(error)
            {
               
                return console.log(error)
            }
            console.log('message was deliverd')
           

        })

})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geo Loactio nis not support your browser!')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((Position)=>{
       // console.log(Position)
        socket.emit('sendLoction',{
            latitude:Position.coords.latitude,
            longitude:Position.coords.longitude
        },()=>{

            console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')navigator.geolocation
//     socket.emit('increment')
// })
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
    

})
