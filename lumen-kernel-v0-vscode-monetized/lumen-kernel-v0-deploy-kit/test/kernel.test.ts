import { expect } from "chai";
import { ethers } from "hardhat";

describe("LumenKernelV0", function () {
  it("writes context with sequencing", async () => {
    const [deployer, a] = await ethers.getSigners();
    const Kernel = await ethers.getContractFactory("LumenKernelV0");
    const kernel = await Kernel.deploy(deployer.address);
    await kernel.waitForDeployment();

    const topic = ethers.keccak256(ethers.toUtf8Bytes("TEST.TOPIC"));
    await kernel.grantCapability(topic, a.address, 0x01);

    const tx1 = await kernel.connect(a).writeContext(topic, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, 0);
    await tx1.wait();

    const tx2 = await kernel.connect(a).writeContext(topic, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash, 1);
    await tx2.wait();

    expect(await kernel.topicSeq(topic)).to.equal(2n);
  });
});
