---
title: 'Efficiency Types & Entities'
sidebar_position: 1
---

# Efficiency Types & Entities

### `(Enum)` Efficiency Algorithm Type

```bash
'main', 'ironman', 'ultimate', 'lvl3', 'f2p', 'f2p_lvl3', 'f2p_ironman', 'f2p_lvl3_ironman'
```

<br />

### `(Object)` Skill Meta Method

| Field       | Type   | Description                                                   |
| :---------- | :----- | :------------------------------------------------------------ |
| startExp    | number | What exp to start calculating EHP from.                       |
| rate        | number | The exp per hour for the method.                              |
| realRate?   | number | Scaled exp per hour for the method based on bonuses received. |
| description | string | The description of the method.                                |

<br />

### `(Object)` Bonus

| Field       | Type                                         | Description                                                                         |
| :---------- | :------------------------------------------- | :---------------------------------------------------------------------------------- |
| originSkill | [Skill](/global-type-definitions#enum-skill) | The skill that gives the bonus.                                                     |
| bonusSkill  | [Skill](/global-type-definitions#enum-skill) | The skill that receives the bonus.                                                  |
| startExp    | number                                       | Start exp of origin skill for which bonus skill starts receiving bonus exp.         |
| endExp      | number                                       | End exp of origin skill for which bonus skill stops receiving bonus exp.            |
| maxBonus?   | number                                       | Calculated max bonus a bonus skill can receive from origin skill.                   |
| end         | boolean                                      | Whether the bonus exp is added at the end when calculating EHP for the bonus skill. |
| ratio       | number                                       | The ratio of bonus xp given to bonus skill per exp in origin skill.                 |

<br />

### `(Object)` Skill Meta Config

| Field   | Type                                                                                      | Description                                        |
| :------ | :---------------------------------------------------------------------------------------- | :------------------------------------------------- |
| skill   | [Skill](/global-type-definitions#enum-skill)                                              |                                                    |
| methods | [SkillMetaMethod[]](/efficiency-api/efficiency-type-definitions#object-skill-meta-method) | An array of skill methods used to calculate EHP.   |
| bonuses | [Bonus[]](/efficiency-api/efficiency-type-definitions#object-bonus)                       | A list of bonuses the skill gives to other skills. |

<br />

### `(Object)` Boss Meta Config

| Field | Type                                       | Description                            |
| :---- | :----------------------------------------- | :------------------------------------- |
| boss  | [Boss](/global-type-definitions#enum-boss) |                                        |
| rate  | number                                     | The kills per hour for a certain boss. |
