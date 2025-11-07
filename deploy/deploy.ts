import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedStrengthTracker = await deploy("StrengthProgressTracker", {
    from: deployer,
    log: true,
  });

  console.log(`StrengthProgressTracker contract: `, deployedStrengthTracker.address);
};
export default func;
func.id = "deploy_strengthTracker"; // id required to prevent reexecution
func.tags = ["StrengthProgressTracker"];


