import { COMBAT_SKILLS, MEMBER_SKILLS, Player } from "@wise-old-man/utils";

export function getBuildContextMetrics(player: Player, metrics: any[]) {
    let filteredMetrics = metrics;
  
    switch(player.build) {
        case 'f2p':
        filteredMetrics = metrics.filter(item => !MEMBER_SKILLS.includes(item.metric));
        break;
        case 'f2p_lvl3':
        filteredMetrics = metrics.filter(item => ![...MEMBER_SKILLS, ...COMBAT_SKILLS].includes(item.metric));
        break;
        case 'lvl3':
        filteredMetrics = metrics.filter(item => !COMBAT_SKILLS.includes(item.metric));
        break;
    }

    return filteredMetrics;
}