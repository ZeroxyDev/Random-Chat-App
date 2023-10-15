import { Dialog, Transition } from "@headlessui/react";
import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { faCheckCircle, faComment, faLock, faPlus, faRandom, faRightToBracket, faShuffle, faUser, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from "framer-motion"
import { mainConfig } from "config/config";

export default function Sidebar() {
    
    const router = useRouter();
    let [rooms, setRooms] = useState([]);
    let [user, setUser] = useState(null);
    let [isOpen, setIsOpen] = useState(false);
    let [protectedRoom, setProtected] = useState(false);
    let [password, setPassword] = useState('');
    const { connection } = useConnection();
    let [onroom, setOnroom] = useState(false);
    let [online, setOnline] = useState(0);
    const { pathname } = useRouter();
/*     random user */



/* rooms */

    useEffect(() => {
        if (connection) {
            connection.emit('fetchUser');
            connection.on('user', data => {
                if (data === null) {
                    router.push('/');
                } else {
                    setUser(data);
                }
            });

            return () => {
                connection.off('user', data => {
                    if (data === null) {
                        router.push('/');
                    } else {
                        setUser(data);
                    }
                });
            }
        }
    }, [connection]);

    useEffect(() => {
        if (connection) {
            connection.emit('fetchRooms');
            connection.on('rooms', data => {
                setRooms(data.rooms.slice(-10));
            });
            
            return () => {
                connection.off('rooms', data => {
                    if (data.isLogged) {
                        setUser(data.user);
                    }
                    setRooms(data.rooms.slice(-10));
                });
            }
        }
    }, []);

    function getRandomInt(max) {
        if(rooms.length == 1){
            max = 0
        }
        return Math.floor(Math.random() * max);
      }


    const filterroomsrandom2 = rooms.filter(arr => arr.name == 'random')
    const filterroomsrandom = filterroomsrandom2.filter(arr => arr.users < 2)
    const filterrooms2 = rooms.filter(arr => !arr.passwordProtected)
    const filterrooms = filterrooms2.filter(arr => arr.name != "random")

    async function joinrandom(){
        if (filterrooms.length >= 1){
            const randomroom = getRandomInt(filterrooms.length)
            JoinRoom(rooms[randomroom])
            router.push(`/rooms/${rooms[randomroom].id}`)
        }
    }

    async function chatrandom(){

        if(pathname != "/rooms"){
            await LeaveRoom()
        }

      
        
        if (filterroomsrandom.length >= 1){
            const randomroom = getRandomInt(filterroomsrandom.length)
            router.push(`/random/${rooms[randomroom].id}`)
        }else{
            CreateRoom()
        }
    }


function CreateRoom(){
    const name = "random";
    const password = "";
    const maxUsers = 2;

    connection.emit('createRoom', { name, password, maxUsers });
    connection.on('createRoom', data => {
        const result = data;
        if (result.success) {
            router.push(`/random/` + result.data.id)
        } else {
            
        }
    });
}
    

    useEffect(() => {
        if(router.pathname == "/rooms"){
            setOnroom(false) 
        }else{
            setOnroom(true)
        }

        connection?.off('UsersOnline').on('UsersOnline', data => {
            if (data.success) {
                setOnline(data.users);
            } else {
            }
        });
    }, [router]);

    const LeaveRoom = async () => {
        connection.emit('leaveRoom');
        connection.on('leaveRoom', data => {
            if (data.success) {
               
            }
            
        });
    }

    const JoinRoom = room => {
        const { id, passwordProtected } = room;
        if (passwordProtected) {
            setIsOpen(true);
            setProtected(room);

            if (password) {
                connection.emit('joinRoom', { id, password });
            }

        } else {
            connection.emit('joinRoom', { id });
        }

        connection.off('joinRoom').on('joinRoom', data => {
            if (data.success) {
                setIsOpen(false);
                setPassword('');
                router.push('/rooms/' + id);
            } else {
                if (data?.alreadyIn) {
                    router.push('/rooms/' + id);
                } else {
                    alert(data.error)
                }
            }
        });
    }

    return <>
        {router.pathname != "/random" && <motion.div
    initial={{opacity: 0}}
  animate={{ opacity: 1 }}
  transition={{ duration: 0, type: "tween" }}
>
        <Transition appear show={isOpen} as={Fragment}>

            <Dialog as="div" className="relative z-10" onClose={() => {
                setIsOpen(false);
                setPassword('');
            }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-dark-1 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-white"
                                >
                                    Password Protected Room
                                </Dialog.Title>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    JoinRoom(protectedRoom);
                                }}>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-300">
                                            This room is password protected. Please enter the password to join.
                                        </p>

                                        <input
                                            type="password"
                                            className="w-full mt-2 p-2 rounded-md bg-dark-2 text-white outline-none border border-white/5 focus:border-gray-500 transition-all duration-200"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            
                                            type="submit"
                                            className="transition-all duration-200 inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
                                        >
                                            Join
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>

        <div className="sticky top-0 md:h-screen md:w-96 bg-dark-2 text-white p-6 md:flex md:flex-col md:justify-between hidden">
        <div className="flex flex-col items-center space-y-3">
                <span className="text-2xl font-semi-bold leading-normal mb-4"><div className="flex flex-row justify-between w-full items-center h-12 bg-zinc-500/10 p-2 rounded-lg"><img className="h-32 w-32 object-cover" src={mainConfig?.imageApp}/></div> <p className="text-sm flex flex-row items-center top-5 bg-dark-3 p-1 pl-3 rounded-xl absolute right-4 top-8">{online} <FontAwesomeIcon className=" h-3 mx-2" icon={faUser} /></p></span> 
           <div className="flex flex-row rounded-lg w-full"> 
                <button onClick={() => router.push('/rooms/create')} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Create<FontAwesomeIcon className=" h-3 mx-2" icon={faPlus} /> </button>
                <button onClick={() => joinrandom()} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Random<FontAwesomeIcon className=" h-3 mx-2" icon={faRandom} /></button></div>
                 <button onClick={() => chatrandom()} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Chat with stranger<FontAwesomeIcon className=" h-3 mx-2" icon={faUserSecret} /></button>
            </div>
            <div className="flex flex-col h-full mt-4 space-y-2">
                {rooms.map(room => {
                    return <div>
                        {room.name != "random" && <div key={room.id} className="flex flex-row items-center gap-2 p-2 pr-4 rounded-md hover:bg-zinc-500/5 transition-all duration-200 cursor-pointer" onClick={() => JoinRoom(room)}>
                        <img src={`${ mainConfig.initialsAPI + room?.name || mainConfig.initialsAPI + "NoName"}.png`} alt="username" className="w-10 h-10 rounded-md" />
                        <div className="flex-shrink-0 flex flex-col">
                            <span className="font-semibold">{room.name}</span>
                            {!room?.owner?.verified ? <span className="text-xs text-gray-400">Created by {room?.owner?.username.split(0, 5) + '...'}</span> : <span className="text-xs text-gray-400 flex flex-row items-center">Created by {room?.owner?.username.split(0, 5)} <FontAwesomeIcon className=" h-3 mx-2" icon={faCheckCircle} /></span> }
                        </div>
                        <div className="flex flex-row justify-end w-full items-center space-x-1">
                            {room.passwordProtected && <FontAwesomeIcon className=" h-3 mx-2" icon={faLock} />}
                            <span className="text-xs text-gray-400 bg-[#18191b] rounded-md p-1">{room.users || 0}/{room.maxUsers}</span>
                        </div>
                    </div>}
                    </div>
                })}
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6 w-full">
                <div className="flex flex-row items-center space-x-2 w-full hover:bg-zinc-500/5 p-4 rounded-lg transition-all duration-200">
                    <img src={`${mainConfig.avatarAPI + user?.username || mainConfig.avatarAPI +  "clqu"}.png`} alt="username" className="h-10 w-10 rounded-full" />
                    {!user?.verified ? <span className="font-semibold">{user?.username}</span> : <span className="font-semibold flex -flex-row items-center">{user?.username} <FontAwesomeIcon className=" h-3 mx-2" icon={faCheckCircle} /></span> }
                </div>
            </div>
        </div>

        {!onroom && <div className="absolute top-0 h-screen w-full bg-dark-2 text-white p-6 md:hidden flex-col justify-between flex">
        <div className="flex flex-col items-center space-y-3">
                <span className="text-2xl font-semi-bold leading-normal mb-4"><div className="flex flex-row justify-between w-full items-center h-12 bg-zinc-500/10 p-2 rounded-lg"><img className="h-32 w-32 object-cover" src={mainConfig?.imageApp}/></div> <p className="text-sm flex flex-row items-center top-5 bg-dark-3 p-1 pl-3 rounded-xl absolute right-4 top-8">{online} <FontAwesomeIcon className=" h-3 mx-2" icon={faUser} /></p></span> 
                <div className="flex flex-row rounded-lg w-full"> 
                <button onClick={() => router.push('/rooms/create')} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Create<FontAwesomeIcon className=" h-3 mx-2" icon={faPlus} /> </button>
                <button onClick={() => joinrandom()} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Random<FontAwesomeIcon className=" h-3 mx-2" icon={faRandom} /></button></div>
                 <button onClick={() => chatrandom()} className="m-2 w-full rounded-md px-4 py-2  text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200 flex flex-row items-center justify-center">Chat with stranger<FontAwesomeIcon className=" h-3 mx-2" icon={faUserSecret} /></button>
            </div>
            <div className="flex flex-col h-full mt-4 space-y-2">
                {rooms.map(room => {
                    return <div>
                        { room.name != "random" && <div key={room.id + " 2"} className="flex flex-row items-center gap-2 p-2 pr-4 rounded-md hover:bg-zinc-500/5 transition-all duration-200 cursor-pointer" onClick={() => JoinRoom(room)}>
                        <img src={`${mainConfig.initialsAPI +room?.name || mainConfig.initialsAPI + "NoName"}.png`} alt="username" className="w-10 h-10 rounded-md" />
                        <div className="flex-shrink-0 flex flex-col justify-center ">
                            <span className="font-semibold truncate">{room.name}</span>
                            {!room?.owner?.verified ? <span className="text-xs text-gray-400">Created by {room?.owner?.username.split(0, 5) + '...'}</span> : <span className="text-xs text-gray-400 flex flex-row items-center">Created by {room?.owner?.username.split(0, 5)} <FontAwesomeIcon className=" h-3 mx-2" icon={faCheckCircle} /></span> }
                        </div>
                        <span className="text-xs text-gray-400 bg-[#18191b] rounded-md p-1 absolute right-4 ">{room.users || 0}/{room.maxUsers}</span>
                        <div className="flex flex-col justify-end w-full items-center space-x-1">
                            {room.passwordProtected && <FontAwesomeIcon className=" h-4 mx-2" icon={faLock} />}
                        </div>
                    </div>}
                    </div>
                })}
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6 w-full">
                <div className="flex flex-row items-center space-x-2 w-full hover:bg-zinc-500/5 p-4 rounded-lg transition-all duration-200">
                    <img src={`${mainConfig.avatarAPI + user?.username || mainConfig.avatarAPI + "clqu"}.png`} alt="username" className="h-10 w-10 rounded-full" />
                    {!user?.verified ? <span className="font-semibold">{user?.username}</span> : <span className="font-semibold flex -flex-row items-center">{user?.username} <FontAwesomeIcon className=" h-3 mx-2" icon={faCheckCircle} /></span> }
                </div>
            </div>
        </div>}
        </motion.div>}
    </>
}