import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { faCheckCircle, faCrown, faLink, faLock, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from "framer-motion"
import cn from 'clsx';
import { animConfig, animConfigOther, mainConfig } from "config/config";

export default function Room() {
    const router = useRouter();
    let [room, setRoom] = useState(null);
    let [members, setMembers] = useState([]);
    let [messages, setMessages] = useState([]);
    const { connection } = useConnection();
    const { id } = router.query
    let [waiting, setWaiting] = useState(true);
    let [rooms, setRooms] = useState([]);
    let [error, setError] = useState(null);
    let [onroom, setOnroom] = useState(false);
    let [loaded, setLoaded] = useState(false);
    let [user, setUser] = useState(null);
    let [typping, setTypping] = useState([]);
    let [istypping, setIstypping] = useState(false);
    let [showMembers, setShowMembers] = useState(true);
    let [online, setOnline] = useState(0);

    const ref = useRef();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [messages]);

    const CreateRoom = event => {

        const name = id;
        const password = "";
        const maxUsers = 2;

        connection.emit('createRoom', { name, password, maxUsers });
        connection.on('createRoom', data => {
            const result = data;

            if (result.success) {
                router.push('/random/' + name);
                connection.emit('joinRoomStranger', { name });
            } else {
                setError(data.message);
            }
        });
    }

    useEffect(() => {
        if (connection) {
            connection.emit('fetchRooms');
            connection.on('rooms', data => {
                setRooms(data.rooms);
            });
            return () => {
                connection.off('rooms', data => {
                    if (data.isLogged) {
                        setUser(data.user);
                    }
                    setRooms(data.rooms);
                });
            }
        }
    }, [router]);

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
        if(router.pathname == "/random"){
            setOnroom(false) 
        }else{
            setOnroom(true)
        }

        if (!loaded){
            joinrandom()
            setLoaded(true)
        }

        connection.off('UsersOnline').on('UsersOnline', data => {
            if (data.success) {
                setOnline(data.users);
            } else {
            }
        });


    }, [router]);

    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    function getRandomInt(max) {
        if(rooms.length == 1){
            max = 0
        }
        return Math.floor(Math.random() * max);
      }

    async function joinrandom(){
        if (connection.emit('joinRoomStranger', { id })){
            router.push('/random/' + id);
        }else{
            CreateRoom()
        }
    }

    useEffect(() => {
        if (connection) {
            connection.emit('fetchUser');
            connection.on('user', data => {
                if (data === null) {
                    router.push('/');
                }
            });

            return () => {
                connection.off('user', data => {
                    if (data === null) {
                        router.push('/');
                    }
                });
            }
        }
    }, [connection]);
    useEffect(() => {
        if (connection) {
            connection.off('message').on('message', data => {
                setMessages(messages => [...messages, data]);
            });

            connection.off('ClearMessages').on('ClearMessages', data => {
                const ss = messages.filter((s) => s.system)
                setMessages([{
                    "system": true,
                    "message": "a stranger left the room"
                }]);
            });

            return () => {
                connection.off('message', data => {
                    setMessages(messages => [...messages, data]);
                });
            }
        }


    }, [connection]);

    useEffect(() => {

        if (members.length < 2){
            setMessages([{
                "user": {
                    "username": "Bot",
                    "verified": true,
                },
                "message": "Waiting stranger...",
                "date": new Date(),
                "self": false
            }])
        }else{
            const ss = messages.filter((s) => s.system)
            setMessages([{
                "system": true,
                "message": "A stranger joined the room"
            }]);
        }

    }, [members, router]);

    useEffect(() => {

        connection?.off('IsTypping').on('IsTypping', data => {
            setIstypping(true)
            setTypping(data)
            if(!istypping){
                setTimeout(function (){
                setIstypping(false)
            }, 2000)
            }
            
        });

    }, [istypping]);

    function typpingu(){
        connection.emit('IsTypping');
    }

    useEffect(() => {
        if (connection) {
            const fetchRoomListener = data => {
                if (!data.success) router.push('/rooms');
                setRoom(data.data);
            }
            const roomMembersListener = data => {
                if (!data.success) router.push('/rooms');
                setMembers(data.data);
            }

            connection.emit('roomMembers');
            connection.on('roomMembers', roomMembersListener);

            connection.emit('fetchRoom');
            connection.on('fetchRoom', fetchRoomListener);

            return () => {
                connection.off('roomMembers', roomMembersListener);
                connection.off('fetchRoom', fetchRoomListener);
            }
        }
    }, [connection, router]);

    const LeaveRoom = () => {
        connection.emit('leaveRoomStranger');
        connection.on('leaveRoomStranger', data => {
            if (data.success) {
                router.push('/rooms');
            }
            
        });

    }

        /*     IMAGES   */
    
        let [file, setFile] = useState(null);
        let [filetype, setFiletype] = useState([]);
        let [preview, setPreview] = useState([]);
        let [imgsrc, setImgsrc] = useState([]);
    
        const handleFiles = async (file) => {
            const selectedFile = file.target.files[0];
            setFile(selectedFile)
            const url = window.URL.createObjectURL(selectedFile) || ""
            setFiletype(selectedFile.type)
            setPreview(url)
          }
          function resetFile(){
            if (file){
                setFile(null)
                setFiletype(null)
            }
          }
        function Image(props, type){
            var blob = new Blob( [ props ], { type: type } );
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL( blob );
            return(imageUrl)}

        /*     END IMAGES */

    const dateNow = date => {
        const now = new Date();
        const msgDate = new Date(date);
        if (now - msgDate < 1000 * 60) {
            if (Math.floor((now - msgDate) / 1000) === 1) {
                return Math.floor((now - msgDate) / 1000) + ' seconds ago';
            } else {
                return 'now';
            }
        }
        else if (now.getDate() === msgDate.getDate() && now.getMonth() === msgDate.getMonth() && now.getFullYear() === msgDate.getFullYear()) {
            const diff = now.getTime() - msgDate.getTime();
            const minutes = Math.floor(diff / 1000 / 60);
            return `${minutes} minutes ago`;
        }
        else if (now.getDate() === msgDate.getDate() && now.getMonth() === msgDate.getMonth() && now.getFullYear() === msgDate.getFullYear()) {
            const diff = now.getTime() - msgDate.getTime();
            const hours = Math.floor(diff / 1000 / 60 / 60);
            return `${hours} hours ago`;
        }
        else if (now.getMonth() === msgDate.getMonth() && now.getFullYear() === msgDate.getFullYear()) {
            const diff = now.getTime() - msgDate.getTime();
            const days = Math.floor(diff / 1000 / 60 / 60 / 24);
            return `${days} days ago`;
        }
        else if (now.getFullYear() === msgDate.getFullYear()) {
            const diff = now.getTime() - msgDate.getTime();
            const months = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
            return `${months} months ago`;
        }
        else {
            const diff = now.getTime() - msgDate.getTime();
            const years = Math.floor(diff / 1000 / 60 / 60 / 24 / 30 / 12);
            return `${years} years ago`;
        }
    }
    return <>
    
        <div className={`${showMembers && '2xl:grid'} grid-cols-12`}>
            <div className="col-span-9 2xl:w-full">
                <div className="border-b border-zinc-500/5 flex items-center justify-between px-6 py-5 text-white">
                    <div className="flex items-center">
                        <img src={mainConfig.initialsAPI + "ac"} alt="username" className="w-14 h-14 rounded-full" />
                        <div className="ml-3">
                            <p className="text-lg font-medium flex items-center">{members.filter(a=>a).length == 1 ? <p>Waiting stranger...</p> : <p>Anonymous Chat</p>}</p>
                            <p className="text-xs font-medium italic text-gray-500">{members.filter(a=>a).length == 1 ? <p>Searching stranger to talk...</p> : <p>This room is with a stranger. </p>}</p>
                        </div>
                    </div>
                    <div className="flex flex-row items-center">
                        <button onClick={LeaveRoom} className="bg-zinc-500/10 hover:bg-zinc-500/20 rounded-full p-2 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                        <button onClick={() => setShowMembers(!showMembers)} className="bg-zinc-500/10 hidden 2xl:flex hover:bg-zinc-500/20 rounded-full p-2 mr-2">
                        <FontAwesomeIcon className=" h-4 mx-1" icon={faUser} />
                        </button>
                    </div>
                </div>
                <div className="px-6 py-5 md:max-h-[81vh] max-h-[80vh] overflow-auto" ref={ref}>
                    <div className="flex flex-col space-y-4">
                    <AnimatePresence>
                    <div className="flex flex-col space-y-4" 
                    
                     > 
                        {messages.filter(Boolean).filter(el => {
                            if (!el.system) {
                                if (el.user) return true;
                                if (el.message && el.message.length > 0) return true;

                                return false;
                            } else return true;
                        }).map((message, index) => {
                            if (message.system) {
                                return <div key={index} className="flex justify-center items-center">
                                    <p className="text-xs text-gray-500">{message.message}</p>
                                </div>
                            } else {
                                if (message.self) {
                                    return <motion.li  key={index} className="flex justify-end items-center gap-2"
                                    {...animConfig}
                                    >
                                        <div className="flex flex-col items-end">
                                            
                                            {!message.user.verified ? <p className="text-xs text-gray-500  p-1 mr-1 rounded-lg">Me</p> : <p className="text-xs text-gray-500  p-1 mr-1 rounded-lg flex items-center">Me<FontAwesomeIcon className=" h-3 mx-1" icon={faCheckCircle} /></p>}
                                            <div className="bg-zinc-500/10 rounded-xl p-3">
                                            {message.file && <img className="h-[300px] rounded-lg justify-end mb-2 object-cover" src={Image(message.file, message.type)}/>}
                                                <p className="text-sm text-white break-all">{message.message}</p>
                                                <p className="text-xs text-gray-500">{dateNow(message.date)}</p>
                                            </div>
                                        </div>
                                        <img src={`${mainConfig.avatarAPI + message.user?.username.slice(0, 2) + id || "NoName"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                    </motion.li> 
                                } else {
                                    return <motion.li key={index} className="flex justify-start items-center gap-2"
                                    {...animConfigOther}
                                    >
                                        <img src={`${mainConfig.avatarAPI + message.user?.username.slice(0, 2) + id || "NoName"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                        <div className="flex flex-col items-start">
                                        {message.user.verified ? <p className="text-xs text-gray-500  p-1 mr-1 rounded-lg flex flex-row items-center">{message.user.username != "Bot" ? "Stranger" : "Bot"}<FontAwesomeIcon className=" h-3 mx-1" icon={faCheckCircle} /> </p> : <p className="text-xs text-gray-500  p-1 mr-1 rounded-lg flex items-center">Stranger</p>}
                                            <div className="bg-zinc-500/10 rounded-xl p-3">
                                            {message.file && <img className="h-[300px] rounded-lg justify-end mb-2 object-cover" src={Image(message.file, message.type)}/>}
                                                <p className="text-sm text-white break-all">{message.message}</p>  
                                                <p className="text-xs text-gray-500">{dateNow(message.date)}</p>
                                            </div>
                                        </div>
                                        {members.length < 2 && <div className="loading flex flex-row items-center justify-center absolute h-full w-full mt-7"><div></div><div></div></div>}
                                    </motion.li>
                                }
                            }
                        })}
                     </div>
                     </AnimatePresence>
                     {members?.map(member => (
                        <div> {member?.username != user?.username &&
                            <div className="flex flex-row items-center">
                           {istypping && typping?.user.username != user?.username && <img src={`${mainConfig.avatarAPI + member?.username.slice(0, 2) + id || "NoName"}.png`} alt="username" className="w-10 h-10 rounded-full" />}
                            {istypping && typping?.user.username != user?.username && <p className="text-xs text-gray-500 mt-2">Stranger is typing...</p>}
                        </div>}
                               </div>
                        
                      
                    ))}
                    </div>
                </div>

                <div className={`border-t border-zinc-500/5 bg-[#111214] px-6 py-5 fixed bottom-0 w-full md:w-fill-available ${showMembers && "2xl:max-w-[75%]"}`}>
                <form onSubmit={e => {
                        e.preventDefault();
                        const message = e.target.message.value;
                        if(!message?.length > 0 && !file)return
                        if (message && !file) {
                            connection.emit('message', { message });
                            e.target.message.value = '';
                        }else{
                            connection.emit('message', { message, file: file, type: filetype });
                            e.target.message.value = '';
                            setFile(null)
                        }
                    }}>

                      <motion.li className="flex flex-col space-y-4" layout initial='initial' animate='animate' exit='animate'> 
                        <div className="w-full flex flex-row justify-end">
                        {file && <div className="bg-zinc-500/10 rounded-lg w-fit my-4 h-fit p-2 text-white outline-none " >
                        <button className="" onClick={() => resetFile()}><FontAwesomeIcon className=" h-4 w-full text-zinc-500/50 text-white mx-1" icon={faXmark} /></button>
                            <img className="h-60 rounded-lg justify-end object-cover" src={preview}/>
                        </div>}
                        </div>
                      </motion.li> 

                        <div className="flex items-center">
                            <input onChange={() => typpingu()} name="message" disabled={members.filter(a=>a).length == 1} type="text" className={members.filter(a=>a).length == 1 ? `bg-zinc-500/10 rounded-md w-full px-4 py-2 cursor-not-allowed text-white outline-none` : `bg-zinc-500/10 rounded-md w-full px-4 py-2 text-white outline-none`} autoComplete="off" placeholder={members.filter(a=>a).length == 1 ? "Waiting stranger..." : `Type a message...`} />
                            <button type="button" className="relative bg-zinc-500/10 hover:bg-zinc-500/20 rounded-md p-2 ml-2 transition-all duration-200">
                                <div className="flex flex-col justify-center items-center">
                                <FontAwesomeIcon className=" h-6 w-6 text-white rotate-90 mx-1" icon={faLink} />
                            <input  id="file" type="file" onChange={handleFiles} className="h-full w-full text-white mx-1 absolute opacity-0"></input>
                                </div>
                            </button>
                            <button type="submit" disabled={members.filter(a=>a).length == 1} className={members.filter(a=>a).length == 1 ? `bg-zinc-500/10 hover:bg-zinc-500/20 rounded-md p-2 ml-2 transition-all duration-200 cursor-not-allowed` : `bg-zinc-500/10 hover:bg-zinc-500/20 rounded-md p-2 ml-2 transition-all duration-200`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
           {showMembers && <div className="col-span-3 border-l border-zinc-500/5 h-screen w-full 2xl:block hidden">
                <div className="overflow-y-auto h-full p-3 space-y-2">
                    {members?.map(member => (
                        <div> {member?.username != user?.username ?
                            <div className="flex items-center justify-between px-6 py-5 text-white bg-zinc-500/5 rounded-lg">
                            <div className="flex items-center w-full">
                                <img src={`${mainConfig.avatarAPI + member?.username.slice(0, 2) + id || mainConfig.initialsAPI + "NoName"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                <div className="ml-3 flex items-center justify-between gap-2 w-full">
                                {member?.verified ? <p className="text-sm font-medium flex flex-row items-center">Stranger <FontAwesomeIcon className=" h-3 mx-1" icon={faCheckCircle} /></p> : <p className="text-sm font-medium">Stranger</p>}
                                </div>
                            </div>
                        </div> : <div className="flex items-center justify-between px-6 py-5 text-white bg-zinc-500/5 rounded-lg">
                            <div className="flex items-center w-full">
                                <img src={`${mainConfig.avatarAPI + member?.username.slice(0, 2) + id}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                <div className="ml-3 flex items-center justify-between gap-2 w-full"> {member?.verified ? <p className="text-sm font-medium flex flex-row items-center">Me <FontAwesomeIcon className=" h-3 mx-1" icon={faCheckCircle} /></p> : <p className="text-sm font-medium">Me</p>}
                               
                                </div>
                            </div>
                        </div>}
                               </div>
                        
                      
                    ))}
                </div>
            </div>}
        </div>
    
    </>
}