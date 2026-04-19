import MenuButton from "./MenuButton";
import { closeCurrentView } from "../utils/closeCurrentView";

type TopMenuProps = {
  onOpenModal: (modal: string) => void;
  onOpenAlert: (alert: string) => void;
};

function ClipboardIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="3" y="2.6" width="9" height="10.4" rx="1.8" stroke="white" strokeWidth="1.1" />
      <rect x="5" y="1.4" width="5" height="2.6" rx="1" fill="white" />
      <path d="M5.2 6.1H9.8" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M5.2 8.1H9.8" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M5.2 10.1H8.6" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerHighIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M2.2 8.8H4.4L7.45 11V4L4.4 6.2H2.2V8.8Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 6C9.8 6.45 10.1 7.1 10.1 7.75C10.1 8.4 9.8 9.05 9.25 9.5"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M10.8 4.75C11.7 5.5 12.2 6.6 12.2 7.75C12.2 8.9 11.7 10 10.8 10.75"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QuestionMarkIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M5.55 5.4C5.55 4.35 6.4 3.5 7.45 3.5C8.5 3.5 9.35 4.25 9.35 5.2C9.35 5.95 8.95 6.45 8.25 6.9C7.6 7.3 7.2 7.7 7.2 8.45V8.7"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.2" cy="11.1" r="0.8" fill="white" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M4.2 4.2L10.8 10.8"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10.8 4.2L4.2 10.8"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TopMenu: React.FC<TopMenuProps> = ({ onOpenModal, onOpenAlert }) => {
  return (
    <div className="flex gap-[5px]">

      <MenuButton
        borderColor="none"
        borderWidth="0px"
        icon={<SpeakerHighIcon />}
        background={"#000000"}
        onClick={() => onOpenAlert("music")}
      />

      <MenuButton
        borderColor="none"
        borderWidth="0px"
        icon={<ClipboardIcon />}
        background={"#000000"}
        onClick={() => onOpenModal("note")}
      />

      <MenuButton
        borderColor="none"
        borderWidth="0px"
        icon={<QuestionMarkIcon />}
        background={"#000000"}
        onClick={() => onOpenModal("help")}
      />
      <MenuButton
        borderColor="none"
        borderWidth="0px"
        icon={<CloseIcon />}
        background={"#000000"}
        onClick={closeCurrentView}
      />
    </div >
  );
};

export default TopMenu;
