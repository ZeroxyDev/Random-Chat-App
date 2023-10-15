import { useConnection } from 'context/connect'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion"
export default function Home() {
    const { connection } = useConnection();
    const router = useRouter();
    let [error, setError] = useState(null);


/*     max users permitted variable */
    const maxusers = 30;

    const CreateRoom = event => {
        event.preventDefault();
        var maxus = 0
        if(event.target.maxUsers.value > 1 && event.target.maxUsers.value <= maxusers){
            maxus = event.target.maxUsers.value
        }else{
            maxus = maxusers
        }

        const name = event.target.name.value;
        const password = event.target.password.value;
        const maxUsers = maxus || maxusers;

        connection.emit('createRoom', { name, password, maxUsers });
        connection.on('createRoom', data => {
            const result = data;
            if (result.success) {
                router.push('/rooms/' + result.data.id);
            } else {
                setError(data.message);
            }
        });
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

    return <>
    <AnimatePresence>
    <motion.div
    initial={{x: -500}}
  animate={{ x:0 }}
  transition={{ duration: 0.5, type: "tween" }}
>
        <div>
            <div className="h-screen relative flex flex-col justify-center items-center ">
                <div className="bg-dark-2 md:shadow-lg shadow-none p-8 pb-0 rounded-xl w-80 md:w-[fit-content]">
                    <div className="flex flex-col items-center space-y-3">
                        <span className="text-xl md:text-2xl font-semi-bold leading-normal text-white">Create New Room</span>
                    </div>
                    {error && <div className="w-full rounded-md px-4 p-2 border-red-500 border text-red-500 bg-red-500/20 mt-4">
                        <p>{error || "Something went wrong.."}</p>
                    </div>}
                    <form onSubmit={CreateRoom} className="my-8 w-full md:w-96 h-auto">
                        <div className="relative mb-2">
                            <label htmlFor="name" className="text-sm md:text-[12.5px] leading-tighter text-gray-300 uppercase font-medium cursor-text">Room Name</label>
                            <input id="name" autoComplete='off' className="text-white bg-dark-3 transition-all duration-200 w-full rounded-lg p-3 border border-gray-300/10 focus:border-gray-700 outline-none ring-none" type="text" />
                        </div>
                        <div className="relative mb-2">
                            <label htmlFor="name" className="text-sm md:text-[12.5px] leading-tighter text-gray-300 uppercase font-medium cursor-text">Password <span className="text-xs italic lowercase font-thin opacity-50">optional</span></label>
                            <input id="password" autoComplete='off' className="text-white bg-dark-3 transition-all duration-200 w-full rounded-lg p-3 border border-gray-300/10 focus:border-gray-700 outline-none ring-none" type="text" />
                        </div>
                        <div className="relative mb-2">
                            <label htmlFor="name" className="text-sm md:text-[12.5px] leading-tighter text-gray-300 uppercase font-medium cursor-text">Maximum users <span className="text-xs italic lowercase font-thin opacity-50">optional</span></label>
                            <input id="maxUsers" autoComplete='off' placeholder={maxusers} type="number" min="2" max="30" className="text-white bg-dark-3 transition-all duration-200 w-full rounded-lg p-3 border border-gray-300/10 focus:border-gray-700 outline-none ring-none" />
                        </div>
                        <div className="space-y-9">
                            <div className="text-sm flex justify-end items-center h-full mt-16">
                                <button className="py-2.5 px-12 rounded text-white btn bg-gradient-to-r from-gray-600 to-gray-800 hover:opacity-80 transition-all duration-200">Create</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
       </motion.div>
        </AnimatePresence>
    </>
}
