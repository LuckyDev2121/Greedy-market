import { useEffect, useRef } from "react";
import { getMusicUrl, GAME_MUSIC } from "../config/gameConfig";

type MusicPlayerProps = {
    isMusicPlaying: boolean;
    unlockVersion: number;
}

type SoundPlayerProps = {
    isSoundPlaying: boolean;
    isOpenResultMenu: boolean;
    unlockVersion: number;
}

function attemptPlayback(audio: HTMLAudioElement) {
    const play = () => {
        void audio.play().catch((err) => {
            console.warn("Playback blocked:", err);
        });
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        play();
        return undefined;
    }

    const handleCanPlay = () => {
        audio.removeEventListener("canplay", handleCanPlay);
        play();
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });
    audio.load();

    return () => {
        audio.removeEventListener("canplay", handleCanPlay);
    };
}
function useAudioPlayback(
    audioRef: React.RefObject<HTMLAudioElement | null>,
    shouldPlay: boolean,
    unlockVersion: number,
) {
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        if (shouldPlay) {
            return attemptPlayback(audio);
        } else {
            audio.pause();
        }
    }, [audioRef, shouldPlay, unlockVersion]);
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isMusicPlaying, unlockVersion }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useAudioPlayback(audioRef, isMusicPlaying, unlockVersion);

    return (
        <>
            <audio
                ref={audioRef}
                src={getMusicUrl(GAME_MUSIC.music)}
                loop
                preload="auto"
                autoPlay={isMusicPlaying}
                playsInline
            />
        </>
    );
};

export const SoundPlayer: React.FC<SoundPlayerProps> = ({
    isSoundPlaying,
    isOpenResultMenu,
    unlockVersion,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!isSoundPlaying) return;
        if (!isOpenResultMenu) return;

        const audio = audioRef.current;
        if (!audio) return;

        //  restart sound every time result opens
        audio.currentTime = 0;

        return attemptPlayback(audio);
    }, [isOpenResultMenu, isSoundPlaying, unlockVersion]);

    return (
        <audio
            ref={audioRef}
            src={getMusicUrl(GAME_MUSIC.sound)}
            preload="auto"
            playsInline
        />
    );
};
