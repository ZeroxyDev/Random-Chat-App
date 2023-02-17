import { Dialog, Transition } from "@headlessui/react";
import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

export default function Sidebar() {
    const router = useRouter();
    let [rooms, setRooms] = useState([]);
    let [user, setUser] = useState(null);
    let [isOpen, setIsOpen] = useState(false);
    let [protectedRoom, setProtected] = useState(false);
    let [password, setPassword] = useState('');
    const { connection } = useConnection();
    let [onroom, setOnroom] = useState(false);

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
    }, []);

    useEffect(() => {
        if(router.pathname == "/rooms"){
            setOnroom(false) 
        }else{
            setOnroom(true)
        }
    }, [router]);



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
                <span className="text-2xl font-semi-bold leading-normal mb-4">Rooms</span>
                <button onClick={() => router.push('/rooms/create')} className="w-full rounded-md px-4 py-2 border border-gray-300/5 text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200">Create Room</button>
            </div>
            <div className="flex flex-col h-full mt-4 space-y-2">
                {rooms.map(room => {
                    return <div key={room.id} className="flex flex-row items-center gap-2 p-2 pr-4 rounded-md hover:bg-zinc-500/5 transition-all duration-200 cursor-pointer" onClick={() => JoinRoom(room)}>
                        <img src={`https://avatars.dicebear.com/api/initials/${room?.name || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-md" />
                        <div className="flex-shrink-0 flex flex-col">
                            <span className="font-semibold">{room.name}</span>
                            <span className="text-xs text-gray-400">Created by {room?.owner?.username.split(0, 5) + '...'}</span>
                        </div>
                        <div className="flex flex-row justify-end w-full items-center space-x-1">
                            {room.passwordProtected && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                            </svg>}
                            <span className="text-xs text-gray-400 bg-[#18191b] rounded-md p-1">{room.users || 0}/{room.maxUsers}</span>
                        </div>
                    </div>
                })}
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6 w-full">
                <div className="flex flex-row items-center space-x-2 w-full hover:bg-zinc-500/5 p-4 rounded-lg transition-all duration-200">
                    <img src={`https://avatars.dicebear.com/api/micah/${user?.username || "clqu"}.png`} alt="username" className="h-10 w-10 rounded-full" />
                    <span className="font-semibold">{user?.username}</span>
                </div>
            </div>
        </div>

        {!onroom && <div className="absolute top-0 h-screen w-full bg-dark-2 text-white p-6 md:hidden flex-col justify-between flex">
            <div className="flex flex-col items-center space-y-3">
                <span className="text-2xl font-semi-bold leading-normal mb-4">Rooms</span>
                <button onClick={() => router.push('/rooms/create')} className="w-full rounded-md px-4 py-2 border border-gray-300/5 text-gray-300 bg-zinc-500/10 hover:bg-zinc-500/20 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200">Create Room</button>
            </div>
            <div className="flex flex-col h-full mt-4 space-y-2">
                {rooms.map(room => {
                    return <div key={room.id + " 2"} className="flex flex-row items-center gap-2 p-2 pr-4 rounded-md hover:bg-zinc-500/5 transition-all duration-200 cursor-pointer" onClick={() => JoinRoom(room)}>
                        <img src={`https://avatars.dicebear.com/api/initials/${room?.name || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-md" />
                        <div className="flex-shrink-0 flex flex-col justify-center ">
                            <span className="font-semibold truncate">{room.name}</span>
                            <span className="text-xs text-gray-400">Created by {room?.owner?.username.split(0, 5) + '...'}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-[#18191b] rounded-md p-1 absolute right-4 ">{room.users || 0}/{room.maxUsers}</span>
                        <div className="flex flex-col justify-end w-full items-center space-x-1">
                            {room.passwordProtected && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                            </svg>}
                        </div>
                    </div>
                })}
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6 w-full">
                <div className="flex flex-row items-center space-x-2 w-full hover:bg-zinc-500/5 p-4 rounded-lg transition-all duration-200">
                    <img src={`https://avatars.dicebear.com/api/micah/${user?.username || "clqu"}.png`} alt="username" className="h-10 w-10 rounded-full" />
                    <span className="font-semibold">{user?.username}</span>
                </div>
            </div>
        </div>}
    </>
}