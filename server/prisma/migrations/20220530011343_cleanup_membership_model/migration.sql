/*
  Warnings:

  - The `role` column on the `memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `createdAt` on table `memberships` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `memberships` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('achiever', 'adamant', 'adept', 'administrator', 'admiral', 'adventurer', 'air', 'anchor', 'apothecary', 'archer', 'armadylean', 'artillery', 'artisan', 'asgarnian', 'assassin', 'assistant', 'astral', 'athlete', 'attacker', 'bandit', 'bandosian', 'barbarian', 'battlemage', 'beast', 'berserker', 'blisterwood', 'blood', 'blue', 'bob', 'body', 'brassican', 'brawler', 'brigadier', 'brigand', 'bronze', 'bruiser', 'bulwark', 'burglar', 'burnt', 'cadet', 'captain', 'carry', 'champion', 'chaos', 'cleric', 'collector', 'colonel', 'commander', 'competitor', 'completionist', 'constructor', 'cook', 'coordinator', 'corporal', 'cosmic', 'councillor', 'crafter', 'crew', 'crusader', 'cutpurse', 'death', 'defender', 'defiler', 'deputy_owner', 'destroyer', 'diamond', 'diseased', 'doctor', 'dogsbody', 'dragon', 'dragonstone', 'druid', 'duellist', 'earth', 'elite', 'emerald', 'enforcer', 'epic', 'executive', 'expert', 'explorer', 'farmer', 'feeder', 'fighter', 'fire', 'firemaker', 'firestarter', 'fisher', 'fletcher', 'forager', 'fremennik', 'gamer', 'gatherer', 'general', 'gnome_child', 'gnome_elder', 'goblin', 'gold', 'goon', 'green', 'grey', 'guardian', 'guthixian', 'harpoon', 'healer', 'hellcat', 'helper', 'herbologist', 'hero', 'holy', 'hoarder', 'hunter', 'ignitor', 'illusionist', 'imp', 'infantry', 'inquisitor', 'iron', 'jade', 'justiciar', 'kandarin', 'karamjan', 'kharidian', 'kitten', 'knight', 'labourer', 'law', 'leader', 'learner', 'legacy', 'legend', 'legionnaire', 'lieutenant', 'looter', 'lumberjack', 'magic', 'magician', 'major', 'maple', 'marshal', 'master', 'maxed', 'mediator', 'medic', 'mentor', 'member', 'merchant', 'mind', 'miner', 'minion', 'misthalinian', 'mithril', 'moderator', 'monarch', 'morytanian', 'mystic', 'myth', 'natural', 'nature', 'necromancer', 'ninja', 'noble', 'novice', 'nurse', 'oak', 'officer', 'onyx', 'opal', 'oracle', 'orange', 'owner', 'page', 'paladin', 'pawn', 'pilgrim', 'pine', 'pink', 'prefect', 'priest', 'private', 'prodigy', 'proselyte', 'prospector', 'protector', 'pure', 'purple', 'pyromancer', 'quester', 'racer', 'raider', 'ranger', 'record_chaser', 'recruit', 'recruiter', 'red_topaz', 'red', 'rogue', 'ruby', 'rune', 'runecrafter', 'sage', 'sapphire', 'saradominist', 'saviour', 'scavenger', 'scholar', 'scourge', 'scout', 'scribe', 'seer', 'senator', 'sentry', 'serenist', 'sergeant', 'shaman', 'sheriff', 'short_green_guy', 'skiller', 'skulled', 'slayer', 'smiter', 'smith', 'smuggler', 'sniper', 'soul', 'specialist', 'speed_runner', 'spellcaster', 'squire', 'staff', 'steel', 'strider', 'striker', 'summoner', 'superior', 'supervisor', 'teacher', 'templar', 'therapist', 'thief', 'tirannian', 'trialist', 'trickster', 'tzkal', 'tztok', 'unholy', 'vagrant', 'vanguard', 'walker', 'wanderer', 'warden', 'warlock', 'warrior', 'water', 'wild', 'willow', 'wily', 'wintumber', 'witch', 'wizard', 'worker', 'wrath', 'xerician', 'yellow', 'yew', 'zamorakian', 'zarosian', 'zealot', 'zenyte');

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "role",
ADD COLUMN     "role" "GroupRole" NOT NULL DEFAULT E'member',
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- DropEnum
DROP TYPE "enum_memberships_role";
