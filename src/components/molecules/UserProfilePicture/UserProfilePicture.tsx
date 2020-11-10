import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";

// Typings
import { UserProfilePictureProp } from "./UserProfilePicture.types";

// Components
import {
  ExperienceContext,
  MessageToTheBandReaction,
  Reactions,
} from "components/context/ExperienceContext";

// Hooks
import { useSelector } from "hooks/useSelector";

// Utils | Settings
import {
  DEFAULT_PARTY_NAME,
  DEFAULT_PROFILE_IMAGE,
  RANDOM_AVATARS,
} from "settings";

// Styles
import "./UserProfilePicture.scss";
import * as S from "./UserProfilePicture.styles";

// This would be the global variables and configuration,
// it is here only for the duration of the demo
const DEMO_THEME = {
  fadedWhite: "rgba(255, 255, 255, 0.8)",
  black: "#000",
  borderWidth: "5px",
};

const UserProfilePicture: React.FC<UserProfilePictureProp> = ({
  isAudioEffectDisabled,
  miniAvatars,
  avatarClassName,
  avatarStyle,
  containerStyle,
  setSelectedUserProfile,
  reactionPosition,
  user,
}) => {
  const experienceContext = useContext(ExperienceContext);
  const { muteReactions } = useSelector((state) => ({
    muteReactions: state.room.mute,
  }));

  const [pictureUrl, setPictureUrl] = useState("");

  const randomAvatarUrl = (id: string) =>
    "/avatars/" +
    RANDOM_AVATARS[Math.floor(id?.charCodeAt(0) % RANDOM_AVATARS.length)];

  const avatarUrl = useCallback(
    (id: string, anonMode?: boolean, pictureUrl?: string) => {
      if (anonMode || !id) {
        return setPictureUrl(DEFAULT_PROFILE_IMAGE);
      }

      if (!miniAvatars && pictureUrl) {
        return setPictureUrl(pictureUrl);
      }

      if (miniAvatars) {
        return setPictureUrl(randomAvatarUrl(id));
      }

      return setPictureUrl(DEFAULT_PROFILE_IMAGE);
    },
    [miniAvatars]
  );

  useEffect(() => {
    avatarUrl(user.id, user.anonMode, user.pictureUrl);
  }, [avatarUrl, user.anonMode, user.id, user.pictureUrl]);

  const typedReaction = experienceContext?.reactions ?? [];

  const messagesToBand = typedReaction.find(
    (r) => r.reaction === "messageToTheBand" && r.created_by === user.id
  ) as MessageToTheBandReaction | undefined;

  const imageErrorHandler = useCallback(
    (
      event: HTMLImageElement | React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      const randomAvatar = randomAvatarUrl(user.id);
      setPictureUrl(randomAvatar);

      (event as HTMLImageElement).onerror = null;
      (event as HTMLImageElement).src = randomAvatar;
    },
    [user.id]
  );

  return useMemo(() => {
    return (
      // Theme provider is supposed to wrap the entire app,
      // not every component individualle
      //
      // This is just a demo
      <ThemeProvider theme={DEMO_THEME}>
        <S.Container style={{ ...containerStyle }}>
          {/* Hidden image, used to handle error if image is not loaded */}
          <img
            src={pictureUrl}
            onError={(event) => imageErrorHandler(event)}
            hidden
            style={{ display: "none" }}
            alt={user.anonMode ? DEFAULT_PARTY_NAME : user.partyName}
          />
          <S.Avatar
            onClick={() => setSelectedUserProfile(user)}
            className={avatarClassName}
            backgroundImage={pictureUrl}
            style={{ ...avatarStyle }}
          />

          {Reactions.map(
            (reaction, index) =>
              experienceContext &&
              experienceContext.reactions.find(
                (r) => r.created_by === user.id && r.reaction === reaction.type
              ) && (
                <div key={index} className="reaction-container">
                  <S.Reaction
                    role="img"
                    aria-label={reaction.ariaLabel}
                    className={reaction.name}
                    reactionPosition={reactionPosition}
                  >
                    {reaction.text}
                  </S.Reaction>

                  {!muteReactions && !isAudioEffectDisabled && (
                    <audio autoPlay loop>
                      <source src={reaction.audioPath} />
                    </audio>
                  )}
                </div>
              )
          )}
          {messagesToBand && (
            <div className="reaction-container">
              <S.ShoutOutMessage
                role="img"
                aria-label="messageToTheBand"
                reactionPosition={reactionPosition}
              >
                {messagesToBand.text}
              </S.ShoutOutMessage>
            </div>
          )}
        </S.Container>
      </ThemeProvider>
    );
  }, [
    containerStyle,
    pictureUrl,
    user,
    avatarClassName,
    avatarStyle,
    messagesToBand,
    reactionPosition,
    imageErrorHandler,
    setSelectedUserProfile,
    experienceContext,
    muteReactions,
    isAudioEffectDisabled,
  ]);
};

UserProfilePicture.defaultProps = {
  // profileStyle: "profile-icon",
  avatarClassName: "profile-icon",
  miniAvatars: false,
};

export default UserProfilePicture;
