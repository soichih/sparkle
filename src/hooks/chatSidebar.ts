import { useCallback, useEffect } from "react";

import {
  chatVisibilitySelector,
  selectedChatSettingsSelector,
} from "utils/selectors";

import {
  setPrivateChatTabOpened,
  setVenueChatTabOpened,
  setChatSidebarVisibility,
} from "store/actions/Chat";

import { useSelector } from "./useSelector";
import { useDispatch } from "./useDispatch";
import { useNumberOfUnreadChats } from "./privateChats";
import { useVenueId } from "./useVenueId";
import { useConnectCurrentVenueNG } from "./useConnectCurrentVenueNG";
import { useWindowDimensions } from "hooks/useWindowDimensions";
import { LARGE_SCREEN_WIDTH } from "settings";

export const useChatSidebarControls = () => {
  const dispatch = useDispatch();
  const isExpanded = useSelector(chatVisibilitySelector);
  const chatSettings = useSelector(selectedChatSettingsSelector);

  const expandSidebar = useCallback(() => {
    dispatch(setChatSidebarVisibility(true));
  }, [dispatch]);

  const collapseSidebar = useCallback(() => {
    dispatch(setChatSidebarVisibility(false));
  }, [dispatch]);

  const toggleSidebar = useCallback(() => {
    if (isExpanded) {
      collapseSidebar();
    } else {
      expandSidebar();
    }
  }, [expandSidebar, collapseSidebar, isExpanded]);

  const selectVenueChat = useCallback(() => {
    expandSidebar();
    dispatch(setVenueChatTabOpened());
  }, [dispatch, expandSidebar]);

  const selectPrivateChat = useCallback(() => {
    expandSidebar();
    dispatch(setPrivateChatTabOpened());
  }, [dispatch, expandSidebar]);

  const selectRecipientChat = useCallback(
    (recipientId: string) => {
      expandSidebar();
      dispatch(setPrivateChatTabOpened(recipientId));
    },
    [dispatch, expandSidebar]
  );

  return {
    isExpanded,
    chatSettings,

    expandSidebar,
    selectVenueChat,
    selectPrivateChat,
    selectRecipientChat,
    collapseSidebar,
    toggleSidebar,
  };
};

export const useChatSidebarInfo = () => {
  const numberOfUnreadChats = useNumberOfUnreadChats();
  const venueId = useVenueId();
  const { currentVenue } = useConnectCurrentVenueNG(venueId);

  const chatTitle = currentVenue?.chatTitle ?? "Venue";

  return {
    privateChatTabTitle: `Direct Messages ${
      numberOfUnreadChats ? `(${numberOfUnreadChats})` : ""
    }`,
    venueChatTabTitle: `${chatTitle} Chat`,
  };
};

export const useChatVisibility = () => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  useEffect(() => {
    if (width > LARGE_SCREEN_WIDTH) {
      dispatch(setChatSidebarVisibility(true));
    }
  }, [dispatch, width]);
};
