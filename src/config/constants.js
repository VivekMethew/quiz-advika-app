module.exports = {
  APP: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
  },
  REDIS: {
    REDIS_DB: process.env.REDIS_DB || "eskoops_db",
    REDIS_PLAYERS_GAMES: process.env.REDIS_PLAYERS_GAMES || "player_games",
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    RESET_TOKEN_TIME: process.env.RESET_TOKEN_TIME || 86400,
    PUB_EVENT: {
      DEACTIVATED: "deactivated",
      ACITVATED: "activated",
      RUNNING: "running",
      END: "end",
    },
  },
  USER: {
    ADDONPACK: {
      PACK: 50,
    },
    ROLES: {
      ADMIN: "ADMIN",
      MODERATOR: "MODERATOR",
      PLAYER: "PLAYER",
    },
    LOGIN_TYPE: {
      EMAIL: "email",
      AUTH: "auth",
    },
    STATUS: {
      VERIFIED: "VERIFIED",
      UNVERIFIED: "UNVERIFIED",
    },
    DEFAULT_PASSWORD: "eskoops",
    OTPS: {
      L1: "pending",
      L2: "success",
      L3: "failed",
    },
  },
  CATEGORY: {
    Green: "#37AB0F",
    Blue: "#0368E0",
    Red: "#F93D01",
    Pink: "#E809C5",
  },
  EVENT_TYPE: {
    QUIZ: "quiz",
    POLL: "poll",
  },
  QUIZ_POLL_STATUS: {
    PENDING: "pending",
    ACTIVE: "active",
    DEACTIVATED: "deactivated",
    RUNNING: "running",
    CLOSED: "closed",
  },
  PLAN_TYPE: {
    MONTHLY: "monthly",
    ANNUALLY: "annually",
    FINALLY: "finally",
  },
  PLAN_NAMES: {
    TRIAL: "trial",
    SILVER: "silver",
    GOLD: "gold",
    PLATINUM: "platinum",
  },
  ADMIN: {
    REQS: {
      PENDING: "pending",
      APPROVED: "approved",
      REJECT: "reject",
    },
    SUBS_STATUS: {
      ACTIVE: "active",
      INACTIVE: "inactive",
      PAUSE: "pause",
      CANCEL: "cancel",
    },
  },
  SOCKET: {
    OWNER: "Eskoops",
    WELCOME: "Moderator has joined the lobby",
    ELIMINATED: "Moderator has joined the lobby",
    MODERATOR: {
      TIMER: "countdownTimer",
      JOIN: "moderator_join",
      UPDATE_PERMISSION: "update_permission",
      PARTICIPANTS: "participants",
      SCOREBOARD: "scoreboard",
      MESSAGE: "mode_message",
      ROOM_DATA: "roomData",
      QUIZ_POLL_DETAIL: "quizPollDetail",
      USER_LIVE_STATUS: {
        LABEL1: "ACTIVE",
        LABEL2: "INACTIVE",
        LABEL3: "LEFT",
      },
      MESSAGES: {
        ROOM_DATA: "Successfuly get room data",
      },
    },
    ROLES: {
      M: "moderator",
      P: "player",
    },
    STATES: {
      LOBY: "LOBY",
      PLAY: "PLAY",
    },

    PLAYER: {
      JOIN: "p_join",
      GAME_STATE_CHANGED: "game_state_changed",
      START_EVENT: "start_event",
      PARTICIPANTS: "participants",
      SCOREBOARD: "scoreboard",
      POLL_SCOREBOARD: "poll_scoreboard",
      GIVE_ANSWERS: "give_answers",
      MESSAGE: "p_message",
      PLAYER_ELIMINATED: "p_eliminated",
      ROOM_DATA: "playerRoomData",
      POINTS_DETAILS: "pointsDetail",
      PLAYER_LEADERBOARD: "playerLeaderboard",
      QUIZ_INFO: "quizInfo",
      GAME_INFO: "gameInfo",
      USER_INFO: "userInfo",
      USER_LIVE_STATUS: {
        LABEL1: "ACTIVE",
        LABEL2: "INACTIVE",
        LABEL3: "LEFT",
      },
      PLAYING_STATUS: {
        LABEL1: "RUNNING",
        LABEL2: "PLAYED",
        LABEL3: "PENDING",
      },
      MESSAGES: {
        ROOM_DATA: "Successfuly get room data",
      },
    },
    DISCONNECTED: "disconnect",
  },
};
