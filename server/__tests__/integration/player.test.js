const request = require("supertest");
const moment = require("moment");
const api = require("../../src/api");
const { resetDatabase } = require("../utils");
const { Player } = require("../../src/database/");
const PLAYER_TYPES = require("../../src/api/constants/playerTypes");
const playerService = require("../../src/api/modules/players/player.service");

const USERNAME_VALID = "Psikoi";
const USERNAME_VALID_ALT = "Zezima";
const USERNAME_VALID_ALT_2 = "Cometz";
const USERNAME_VALID_ALT_3 = "Ritzi";
const USERNAME_VALID_ALT_4 = "Hey Jase";
const USERNAME_VALID_ALT_5 = "Sick Nerd";
const USERNAME_VALID_ALT_NUMS = "AgileFlea53";
const USERNAME_VALID_ALT_NUMSPACE = "Mod Ash 2";

const USERNAME_INVALID_LONG = "idontenjoywritingtests";
const USERNAME_INVALID_SPACES = " Zulu ";
const USERNAME_INVALID_SPACES_START = " 991atatime";
const USERNAME_INVALID_SPACES_END = "Lynx Titan ";
const USERNAME_INVALID_CHARACTERS = "Iron-Mammal";

const PLAYER_TYPE_VALID = PLAYER_TYPES[0];
const PLAYER_TYPE_INVALID = "Bronzeman";

beforeAll(async () => {
  await resetDatabase();
});

describe("Player Model", () => {
  test("No arguments", async () => {
    await expect(Player.create()).rejects.toThrow();
  });

  test("Null username", async () => {
    await expect(Player.create({ username: null })).rejects.toThrow();
  });

  test("Empty username", async () => {
    await expect(Player.create({ username: "" })).rejects.toThrow();
  });

  test("Invalid username (has trailing spaces on both ends)", async () => {
    await expect(Player.create({ username: USERNAME_INVALID_SPACES })).rejects.toThrow();
  });

  test("Invalid username (has trailing space on start)", async () => {
    await expect(Player.create({ username: USERNAME_INVALID_SPACES_START })).rejects.toThrow();
  });

  test("Invalid username (has trailing space on end)", async () => {
    await expect(Player.create({ username: USERNAME_INVALID_SPACES_END })).rejects.toThrow();
  });

  test("Invalid username (forbidden characters)", async () => {
    await expect(Player.create({ username: USERNAME_INVALID_CHARACTERS })).rejects.toThrow();
  });

  test("Invalid username (too long)", async () => {
    await expect(Player.create({ username: USERNAME_INVALID_LONG })).rejects.toThrow();
  });

  test("Valid username", async () => {
    const newPlayer = await Player.create({ username: USERNAME_VALID });
    expect(newPlayer.username).toBe(USERNAME_VALID);
  });

  test("Valid username (with numbers)", async () => {
    const newPlayer = await Player.create({ username: USERNAME_VALID_ALT_NUMS });
    expect(newPlayer.username).toBe(USERNAME_VALID_ALT_NUMS);
  });

  test("Valid username (with numbers and space)", async () => {
    const newPlayer = await Player.create({ username: USERNAME_VALID_ALT_NUMSPACE });
    expect(newPlayer.username).toBe(USERNAME_VALID_ALT_NUMSPACE);
  });

  test("Repeated username", async () => {
    await expect(Player.create({ username: USERNAME_VALID })).rejects.toThrow();
  });

  test("Valid username, null type", async () => {
    const args = {
      username: USERNAME_VALID_ALT,
      type: null
    };

    await expect(Player.create(args)).rejects.toThrow();
  });

  test("Valid username, empty type", async () => {
    const args = {
      username: USERNAME_VALID_ALT,
      type: ""
    };

    await expect(Player.create(args)).rejects.toThrow();
  });

  test("Valid username, invalid type", async () => {
    const args = {
      username: USERNAME_VALID_ALT,
      type: PLAYER_TYPE_INVALID
    };

    await expect(Player.create(args)).rejects.toThrow();
  });

  test("Valid username, valid type", async () => {
    const args = {
      username: USERNAME_VALID_ALT,
      type: PLAYER_TYPE_VALID
    };
    const newPlayer = await Player.create(args);
    expect(newPlayer.username).toBe(USERNAME_VALID_ALT);
    expect(newPlayer.type).toBe(PLAYER_TYPE_VALID);
  });
});

describe("Player Service", () => {
  test("formatUsername (trailing spaces on both ends)", () => {
    expect(playerService.formatUsername(USERNAME_INVALID_SPACES)).toBe("Zulu");
  });

  test("formatUsername (trailing space on start)", () => {
    expect(playerService.formatUsername(USERNAME_INVALID_SPACES_START)).toBe("991atatime");
  });

  test("formatUsername (trailing space on end)", () => {
    expect(playerService.formatUsername(USERNAME_INVALID_SPACES_END)).toBe("Lynx Titan");
  });

  test("formatUsername (forbidden characters)", () => {
    expect(playerService.formatUsername(USERNAME_INVALID_CHARACTERS)).toBe("Iron Mammal");
  });

  test("shouldUpdate (undefined args)", () => {
    expect(playerService.shouldUpdate()[0]).toBe(true);
  });

  test("shouldUpdate (invalid args)", () => {
    expect(playerService.shouldUpdate("invalid date")[0]).toBe(true);
  });

  test("shouldUpdate (recent date < 60 secs)", () => {
    const recentDate = new Date(moment().subtract({ seconds: 15 }));
    const [should, seconds] = playerService.shouldUpdate(recentDate);
    expect(should).toBe(false);
    expect(seconds).toBeLessThan(60);
  });

  test("shouldUpdate (old date > 60 secs)", () => {
    const oldDate = new Date(moment().subtract({ minutes: 15 }));
    const [should, seconds] = playerService.shouldUpdate(oldDate);
    expect(should).toBe(true);
    expect(seconds).toBe(15 * 60);
  });

  test("shouldImport (invalid args)", () => {
    expect(playerService.shouldImport("invalid date")[0]).toBe(true);
  });

  test("shouldImport (recent date < 15 hours)", () => {
    const recentDate = new Date(moment().subtract({ hours: 15 }));
    const [should, seconds] = playerService.shouldImport(recentDate);
    expect(should).toBe(false);
    expect(seconds).toBeLessThan(24 * 60 * 60);
  });

  test("shouldImport (old date > 24 hours)", () => {
    const oldDate = new Date(moment().subtract({ hours: 30 }));
    const [should, seconds] = playerService.shouldImport(oldDate);
    expect(should).toBe(true);
    expect(seconds).toBe(30 * 60 * 60);
  });

  test("update (Undefined username)", async () => {
    await expect(playerService.update()).rejects.toThrow();
  });

  test("update (Valid player)", async () => {
    const oldDate = new Date(moment().subtract({ minutes: 15 }));

    expect(playerService.shouldUpdate(oldDate)[0]).toBe(true);

    try {
      const player = await playerService.update(USERNAME_VALID_ALT_2);
      await expect(playerService.update(USERNAME_VALID_ALT_2)).rejects.toThrow();
      expect(playerService.shouldUpdate(player.updatedAt)[0]).toBe(false);
    } catch (e) {
      expect(e.message).toContain("Failed to load hiscores");
    }
  }, 45000);

  test("import (Undefined username)", async () => {
    await expect(playerService.importCML()).rejects.toThrow();
  });

  test("import (Invalid username)", async () => {
    await expect(playerService.importCML(1)).rejects.toThrow();
  });

  test("import (Valid username)", async () => {
    const oldDate = new Date(moment().subtract({ hours: 30 }));

    expect(playerService.shouldImport(oldDate)[0]).toBe(true);

    try {
      const snapshots = await playerService.importCML(USERNAME_VALID_ALT_2);
      expect(snapshots.length).toBeGreaterThan(0);

      await expect(playerService.importCML(USERNAME_VALID_ALT_2)).rejects.toThrow();
    } catch (e) {
      expect(e.message).toContain("Failed to load history from CML");
    }
  }, 60000);

  test("confirmType (Undefined username)", async () => {
    await expect(playerService.confirmType()).rejects.toThrow();
  });

  test("confirmType (Invalid username)", async () => {
    await expect(playerService.confirmType(1)).rejects.toThrow();
  });

  test("confirmType (Valid username, defined type)", async () => {
    const [player] = await playerService.findOrCreate(USERNAME_VALID);
    await player.update({ type: PLAYER_TYPES[1] });
    await player.save();

    const type = await playerService.confirmType(player.username);
    expect(player.type).toBe(PLAYER_TYPES[1]);
    expect(PLAYER_TYPES.includes(type)).toBe(true);
  });

  test("confirmType (Valid player)", async () => {
    const [player] = await playerService.findOrCreate(USERNAME_VALID_ALT);

    try {
      const type = await playerService.confirmType(player.username);
      expect(PLAYER_TYPES.includes(type)).toBe(true);
    } catch (e) {
      expect(e.message).toContain("Failed to load hiscores");
    }
  }, 60000);
});

describe("Players Controller", () => {
  test("Track Player (Undefined username)", async () => {
    const response = await request(api)
      .post("/api/players/track/")
      .send();

    expect(response.status).toBe(400);
  });

  test("Track Player (Empty username)", async () => {
    const response = await request(api)
      .post("/api/players/track/")
      .send({ username: "" });

    expect(response.status).toBe(400);
  });

  test("Track Player (Invalid username)", async done => {
    const response = await request(api)
      .post("/api/players/track/")
      .send({ username: USERNAME_INVALID_CHARACTERS });

    if (response.status === 400) {
      expect(response.body.message).toContain("Failed to load hiscores");
    } else {
      expect([201, 200]).toContain(response.status);
    }

    done();
  }, 60000);

  test("Track Player (Valid)", async done => {
    const response = await request(api)
      .post("/api/players/track/")
      .send({ username: USERNAME_VALID_ALT_3 });

    if (response.status === 400) {
      expect(response.body.message).toContain("Failed to load hiscores");
    } else {
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(USERNAME_VALID_ALT_3);
    }

    done();
  }, 60000);

  test("Import Player (Undefined username)", async () => {
    const response = await request(api)
      .post("/api/players/import/")
      .send();

    expect(response.status).toBe(400);
  });

  test("Import Player (Empty username)", async () => {
    const response = await request(api)
      .post("/api/players/import/")
      .send({ username: "" });

    expect(response.status).toBe(400);
  });

  test("Import Player (Valid username, does not exist)", async done => {
    const response = await request(api)
      .post("/api/players/import/")
      .send({ username: USERNAME_VALID_ALT_4 });

    if (response.status === 400) {
      expect(response.body.message).toContain("Failed to load history from CML");
    } else {
      expect(response.status).toBe(200);
    }

    done();
  }, 60000);

  test("Import Player (Valid)", async done => {
    const response = await request(api)
      .post("/api/players/import/")
      .send({ username: USERNAME_VALID_ALT_5 });

    if (response.status === 400) {
      expect(response.body.message).toContain("Failed to load history from CML");
    } else {
      expect(response.status).toBe(200);
    }

    done();
  }, 60000);
});
