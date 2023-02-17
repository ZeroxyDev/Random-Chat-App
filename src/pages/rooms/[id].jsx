import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Room() {
    const router = useRouter();
    let [room, setRoom] = useState(null);
    let [members, setMembers] = useState([]);
    let [messages, setMessages] = useState([]);
    const { connection } = useConnection();

    useEffect(() => {
        if (connection) {
            connection.off('message').on('message', data => {
                setMessages(messages => [...messages, data]);
            });

            return () => {
                connection.off('message', data => {
                    setMessages(messages => [...messages, data]);
                });
            }
        }
    }, [connection]);

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
        connection.emit('leaveRoom');
        connection.on('leaveRoom', data => {
            if (data.success) {
                router.push('/rooms');
            }
        });
    }

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
        <div className="grid grid-cols-12">
            <div className="col-span-9 md:w-full w-screen">
                <div className="border-b border-zinc-500/5 flex items-center justify-between px-6 py-5 text-white">
                    <div className="flex items-center">
                        <img src={`https://avatars.dicebear.com/api/initials/${room?.name || "No Name"}.png`} alt="username" className="w-14 h-14 rounded-full" />
                        <div className="ml-3">
                            <p className="text-lg font-medium flex items-center">{room?.name} {room?.password && <FontAwesomeIcon className=" h-3 mx-2" icon={faLock} />}</p>
                            <p className="text-xs font-medium italic text-gray-500">{members?.length} members</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button onClick={LeaveRoom} className="bg-zinc-500/10 hover:bg-zinc-500/20 rounded-full p-2 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="px-6 py-5 md:max-h-[74%] max-h-[70vh] overflow-auto">
                    <div className="flex flex-col space-y-4">
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
                                    return <div key={index} className="flex justify-end items-center gap-2">
                                        <div className="flex flex-col items-end">
                                            <p className="text-xs text-gray-500">{message.user.username}</p>
                                            <div className="bg-zinc-500/10 rounded-xl p-3">
                                                <p className="text-sm text-white">{message.message}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{dateNow(message.date)}</p>
                                        </div>
                                        <img src={`https://avatars.dicebear.com/api/micah/${message.user?.username || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                    </div>
                                } else {
                                    return <div key={index} className="flex justify-start items-center gap-2">
                                        <img src={`https://avatars.dicebear.com/api/micah/${message.user?.username || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                        <div className="flex flex-col items-start">
                                            <p className="text-xs text-gray-500">{message.user.username}</p>
                                            <div className="bg-zinc-500/10 rounded-xl p-3">
                                                <p className="text-sm text-white">{message.message}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{dateNow(message.date)}</p>
                                        </div>
                                    </div>
                                }
                            }
                        })}
                    </div>
                </div>

                <div className="border-t border-zinc-500/5 bg-[#111214] px-6 py-5 fixed bottom-0 w-full md:max-w-[62.3%]">
                    <form onSubmit={e => {
                        e.preventDefault();
                        const message = e.target.message.value;
                        if (message) {
                            connection.emit('message', { message });
                            e.target.message.value = '';
                        }
                    }}>
                        <div className="flex items-center">
                            <input name="message" type="text" className="bg-zinc-500/10 rounded-md w-full px-4 py-2 text-white outline-none" autoComplete="off" placeholder="Type a message..." />
                            <button type="submit" className="bg-zinc-500/10 hover:bg-zinc-500/20 rounded-md p-2 ml-2 transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="col-span-3 border-l border-zinc-500/5 h-screen w-full md:block hidden">
                <div className="overflow-y-auto h-full p-3 space-y-2">
                    {members?.map(member => (
                        <div className="flex items-center justify-between px-6 py-5 text-white bg-zinc-500/5 rounded-lg">
                            <div className="flex items-center w-full">
                                <img src={`https://avatars.dicebear.com/api/micah/${member?.username || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-full" />
                                <div className="ml-3 flex items-center justify-between gap-2 w-full">
                                    <p className="text-sm font-medium">{member?.username}</p>
                                    {room?.owner?.username === member?.username && <>
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="text-sm uppercase font-semibold opacity-50">Owner</p>
                                        </div>
                                    </>}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
}