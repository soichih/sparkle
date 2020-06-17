import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";
import UserProfileModal from "components/organisms/UserProfileModal";
import { Dropdown } from "react-bootstrap";

import { isChatValid } from "validation";

import ChatForm from "./ChatForm";
import "./Chatbox.scss";
import { User } from "../UserProfileModal/UserProfileModal";
import ChatMessage from "components/molecules/ChatMessage";

// Don't pull everything
// REVISIT: only grab most recent N from server
const RECENT_MESSAGE_COUNT = 200;

interface PropsType {
  isPrivate?: boolean;
  discussionPartner?: User;
  room?: string;
}

const Chatbox: React.FunctionComponent<PropsType> = ({
  isPrivate,
  discussionPartner,
  room,
}) => {
  const [hasUserSelectedRecipient, setHasUserSelectedRecipient] = useState(
    false
  );
  const [selectedUserProfile, setSelectedUserProfile] = useState();
  const [chatboxMessageType, setChatboxMessageType] = useState(
    room ? "room" : "global"
  );

  useFirestoreConnect("chatsv3");
  const { users, currentUserUID, chats, user, privateChats } = useSelector(
    (state: any) => ({
      users: state.firestore.data.users,
      currentUserUID: state.user.uid,
      chats: state.firestore.ordered.chatsv3,
      privateChats: state.firestore.ordered.privatechats,
      user: state.user,
    })
  );

  useFirestoreConnect({
    collection: "privatechats",
    doc: user.uid,
    subcollections: [{ collection: "chats" }],
    storeAs: "privatechats",
  });

  const listOfChats =
    chats &&
    privateChats &&
    (isPrivate ? privateChats : privateChats.concat(chats));

  let chatsToDisplay =
    listOfChats &&
    listOfChats
      .filter(isChatValid)
      .filter((chat: any) =>
        room
          ? chat.type === "global" ||
            chat.type === "private" ||
            (chat.type === "room" && chat.to === room)
          : true
      )
      .concat()
      .sort((a: any, b: any) => b.ts_utc - a.ts_utc)
      .slice(0, RECENT_MESSAGE_COUNT);

  if (isPrivate && discussionPartner) {
    chatsToDisplay =
      chatsToDisplay &&
      chatsToDisplay.filter(
        (chat: any) =>
          (chat.from === discussionPartner?.id && chat.to === user.uid) ||
          (chat.to === discussionPartner?.id && chat.from === user.uid)
      );
  }

  let privateRecipient;
  const lastChat = chatsToDisplay && chatsToDisplay[0];
  if (
    !isPrivate &&
    !hasUserSelectedRecipient &&
    lastChat &&
    lastChat.type === "private"
  ) {
    if (lastChat?.to === user.uid) {
      privateRecipient = { ...users[lastChat?.from], id: lastChat?.from };
    } else {
      privateRecipient = { ...users[lastChat?.to], id: lastChat?.to };
    }
  }

  useEffect(() => {
    setHasUserSelectedRecipient(false);
  }, [lastChat]);

  const changeChatboxMessageType = (type: string) => {
    setHasUserSelectedRecipient(true);
    setChatboxMessageType(type);
  };

  return (
    <>
      <div className="chatbox-container">
        <div className="chatbox-title">
          <img
            src="/sparkle-icon.png"
            className="side-title-icon"
            alt="sparkle icon"
            width="20"
          />
          Chat
        </div>
        {users && (
          <>
            {!isPrivate && (
              <div className="dropdown-container">
                <label className="recipient-label" htmlFor="type-of-message">
                  To:
                </label>
                <Dropdown>
                  <Dropdown.Toggle id="dropdown-basic">
                    {privateRecipient ? (
                      <>
                        <img
                          src={privateRecipient.pictureUrl}
                          className="picture-logo"
                          alt={privateRecipient.partyName}
                          width="20"
                          height="20"
                        />
                        {privateRecipient.partyName}
                      </>
                    ) : (
                      <>
                        {chatboxMessageType === "global" ? "Everybody" : ""}
                        {chatboxMessageType === "room" ? "This Room" : ""}
                      </>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => changeChatboxMessageType("global")}
                    >
                      everybody
                    </Dropdown.Item>
                    {room && (
                      <Dropdown.Item
                        onClick={() => changeChatboxMessageType("room")}
                      >
                        this room
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            <ChatForm
              type={
                isPrivate || privateRecipient ? "private" : chatboxMessageType
              }
              discussionPartner={privateRecipient || discussionPartner}
              currentUserUID={currentUserUID}
              room={room}
            />
            <div className="message-container">
              {chatsToDisplay &&
                chatsToDisplay.map((chat: any) => (
                  <ChatMessage
                    key={chat.id}
                    user={user}
                    users={users}
                    setSelectedUserProfile={setSelectedUserProfile}
                    isOnProfileModal={!!isPrivate}
                    chat={chat}
                  />
                ))}
            </div>
          </>
        )}
      </div>
      {!discussionPartner && (
        <UserProfileModal
          show={selectedUserProfile !== undefined}
          onHide={() => setSelectedUserProfile(undefined)}
          userProfile={selectedUserProfile}
        />
      )}
    </>
  );
};

export default Chatbox;
