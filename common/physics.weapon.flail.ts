import { Damage } from "./damage";
import {
  applyFriction,
  handleCircleCollisionWithLimits,
  handleCirclesCollision,
} from "./physics.common";
import { ELASTICITY } from "./physics.constants";
import { Player } from "./types/player";
import { Room } from "./types/room";
import { FlailWeapon } from "./types/weapon";
import { add, clampMagnitude, magnitude, multiply, subtract } from "./vector";

export function moveFlailWeapon(
  weapon: FlailWeapon,
  player: Player,
  room: Room,
  elapsedTime: number,
) {
  const acceleration = room.gravity;

  const newPosition = add(
    weapon.position,
    multiply(weapon.velocity, elapsedTime),
    multiply(acceleration, 0.5 * elapsedTime * elapsedTime),
  );
  const newVelocity = clampMagnitude(
    add(weapon.velocity, multiply(acceleration, elapsedTime)),
    weapon.maxSpeed,
  );

  weapon.position = newPosition;
  weapon.velocity = newVelocity;

  // Chain length constraint
  const chainVector = subtract(player.position, weapon.position);
  const currentChainLength = magnitude(chainVector);

  if (currentChainLength > weapon.chainLength) {
    const positionDelta = clampMagnitude(
      chainVector,
      currentChainLength - weapon.chainLength,
    );

    weapon.position = add(weapon.position, positionDelta);
    weapon.velocity = add(
      weapon.velocity,
      // Bounce on chain length
      // The higher the elasticity coefficient, the fastest the weapon will swing
      multiply(positionDelta, ELASTICITY),
    );
  }
}

export function handleFlailWeaponCollisions(
  weapon: FlailWeapon,
  player: Player,
  room: Room,
  elapsedTime: number,
  onPlayerDamage: (damage: Damage) => void,
) {
  for (const otherPlayer of Object.values(room.players)) {
    if (player.id === otherPlayer.id) {
      continue;
    }

    const [, otherPlayerDamage] = handleCirclesCollision(weapon, otherPlayer);

    if (otherPlayerDamage > 0) {
      onPlayerDamage({
        type: "weaponCollision",
        damagedPlayerId: otherPlayer.id,
        playerId: player.id,
        amount: otherPlayerDamage / elapsedTime,
      });
    }

    switch (otherPlayer.weapon.type) {
      case "flail":
        handleCirclesCollision(weapon, otherPlayer.weapon);
        break;
    }
  }
}

export function handleFlailWeaponLimitsCollisions(
  weapon: FlailWeapon,
  player: Player,
  room: Room,
) {
  handleCircleCollisionWithLimits(weapon, room.size.x, room.size.y);
}

export function applyFrictionToFlailWeapon(
  weapon: FlailWeapon,
  player: Player,
  room: Room,
  elapsedTime: number,
) {
  applyFriction(weapon, elapsedTime);
}
