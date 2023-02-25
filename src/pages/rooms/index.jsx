import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Rooms() {
    return <>
        <div className="p-12 flex justify-center h-screen text-center items-center text-white">
            <div>
                <p className="text-2xl">Choose a room on the left or start chatting with stranger!</p>
            </div>
        </div>
    </>
}