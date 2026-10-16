
import React from "react";

const pc = () => {
    const peer = new RTCPeerConnection({
        iceServers: [{urls: "stun:stun.l.google.com:19302"}] 
    }); 

    // Create an offer (Caller)
    const setOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        return offer;
    };

    // Receive an offer and create an answer (Receiver)
    const getOffer = async (offer) => {
        await peer.setRemoteDescription(offer);

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        return answer;
    };

    // Receive the answer (Caller)
    const getAnswer = async (answer) => {
        await peer.setRemoteDescription(answer);
    };

    return {
        peer,
        setOffer,
        getOffer,
        getAnswer,
    };
};

export default pc;
