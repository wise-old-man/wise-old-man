import { COMBAT_SKILLS, MEMBER_SKILLS, Player } from "@wise-old-man/utils";

export function getBuildContextMetrics(player: Player, metrics: any[]) {
    switch(player.build) {
        case 'f2p':
        return metrics.filter(item => !MEMBER_SKILLS.includes(item.metric));
        case 'f2p_lvl3':
        return metrics.filter(item => ![...MEMBER_SKILLS, ...COMBAT_SKILLS].includes(item.metric));
        case 'lvl3':
        return metrics.filter(item => !COMBAT_SKILLS.includes(item.metric));
    }

    return metrics;
}