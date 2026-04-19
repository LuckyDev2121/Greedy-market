import { motion } from "framer-motion";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";


const points = [
    { top: "65px", left: "80px" },
    { top: "40px", left: "185px" },
    { top: "65px", left: "290px" },
    { top: "170px", left: "335px" },
    { top: "280px", left: "290px" },
    { top: "315px", left: "185px" },
    { top: "280px", left: "80px" },
    { top: "170px", left: "30px" },
    { top: "65px", left: "80px" },
];

export default function MovingImage() {
    return (
        <motion.img
            src={getAssetUrl(GAME_ASSETS.hand)}
            className="w-16 h-16 absolute z-50"
            animate={{
                top: points.map(p => p.top),
                left: points.map(p => p.left),
            }}
            transition={{
                duration: 6,
                ease: "easeInOut",
                times: points.map((_, i) => i / (points.length - 1)),
                repeat: Infinity,
            }}
        />
    );
}