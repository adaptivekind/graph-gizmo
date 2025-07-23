import * as d3 from "d3";
import {
  EnrichedLinkDatum,
  EnrichedNodeDatum,
  GraphConfiguration,
  GraphSimulation,
} from "./types";

export const createUpdateConfig =
  (
    fullConfig: GraphConfiguration,
    simulation: GraphSimulation,
    onSearchChange: () => void,
  ) =>
  (configUpdate: Partial<GraphConfiguration>) => {
    const updatedConfig = { ...fullConfig, ...configUpdate };

    // Update the fullConfig object with new values
    Object.assign(fullConfig, configUpdate);

    // Update link force if changed
    if (configUpdate.linkForceFactor !== undefined) {
      const linkForce = simulation.force("link") as d3.ForceLink<
        EnrichedNodeDatum,
        EnrichedLinkDatum
      >;
      if (linkForce) {
        linkForce.strength(
          updatedConfig.getLinkForce(updatedConfig.linkForceFactor),
        );
      }
    }

    // Update charge force if changed
    if (configUpdate.chargeForceFactor !== undefined) {
      const chargeForce = simulation.force(
        "charge",
      ) as d3.ForceManyBody<EnrichedNodeDatum>;
      if (chargeForce) {
        chargeForce.strength(
          updatedConfig.getCharge(updatedConfig.chargeForceFactor),
        );
      }
    }

    // Update center forces if changed
    if (configUpdate.centerForceFactor !== undefined) {
      const forceX = simulation.force("forceX") as d3.ForceX<EnrichedNodeDatum>;
      const forceY = simulation.force("forceY") as d3.ForceY<EnrichedNodeDatum>;
      if (forceX) {
        forceX.strength(updatedConfig.centerForceFactor);
      }
      if (forceY) {
        forceY.strength(updatedConfig.centerForceFactor);
      }
    }

    // Update alpha decay if changed
    if (configUpdate.alphaDecay !== undefined) {
      simulation.alphaDecay(updatedConfig.alphaDecay);
    }

    // Update velocity decay if changed
    if (configUpdate.velocityDecay !== undefined) {
      simulation.velocityDecay(updatedConfig.velocityDecay);
    }

    // Handle search changes (depth or query)
    if (
      configUpdate.searchDepth !== undefined ||
      configUpdate.searchQuery !== undefined
    ) {
      onSearchChange();
    }

    // Restart the simulation with new forces
    simulation.alpha(0.3).restart();
  };
