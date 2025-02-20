// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LicenceNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct LicenseInfo {
        address owner;
        uint256 issuedAt;
        string description;
        uint256 price;
        uint256 licenceTypeId;
    }

    struct LicenceType {
        uint256 id;
        string description;
        uint256 price;
        string ipfsHash;
    }

    mapping(address => uint256[]) private _ownerLicenses;
    mapping(uint256 => LicenseInfo) private _licenses;
    mapping(address => uint256) private _lastTransactionTime;

    uint256 public constant MAX_LICENSES_PER_USER = 4;
    uint256 public constant COOLDOWN_PERIOD = 2 minutes;
    uint256 public constant LOCK_PERIOD = 10 minutes;

    LicenceType[] public availableLicences;

    event LicenceMinted(address indexed owner, uint256 tokenId, uint256 licenceTypeId, uint256 price);
    event PaymentReceived(address indexed from, uint256 amount);

    constructor() payable ERC721("LicenceNFT", "LIC") Ownable() {
        availableLicences.push(LicenceType(0, "Licence Standard", 0.05 ether, "QmX...Standard"));
        availableLicences.push(LicenceType(1, "Licence Premium", 0.1 ether, "QmY...Premium"));
        availableLicences.push(LicenceType(2, "Licence VIP", 0.2 ether, "QmZ...VIP"));
    }

    function mintLicence(uint256 licenceIndex) public payable {
        require(licenceIndex < availableLicences.length, "Licence invalide");

        uint256 price = availableLicences[licenceIndex].price;
        require(msg.value == price, "Montant incorrect");

        require(_ownerLicenses[msg.sender].length < MAX_LICENSES_PER_USER, "Limite atteinte");

        uint256 lastTransaction = _lastTransactionTime[msg.sender];
        require(block.timestamp >= lastTransaction + COOLDOWN_PERIOD, "Attendez avant de racheter");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _licenses[tokenId] = LicenseInfo(
            msg.sender,
            block.timestamp,
            availableLicences[licenceIndex].description,
            price,
            availableLicences[licenceIndex].id
        );
        _ownerLicenses[msg.sender].push(tokenId);

        _lastTransactionTime[msg.sender] = block.timestamp;

        (bool sent, ) = payable(owner()).call{value: price}("");
        require(sent, "Echec du transfert");

        emit PaymentReceived(msg.sender, price);
        emit LicenceMinted(msg.sender, tokenId, availableLicences[licenceIndex].id, price);
    }

    function getAvailableLicenses() public view returns (uint256[] memory, string[] memory, uint256[] memory, string[] memory) {
        uint256 length = availableLicences.length;
        uint256[] memory ids = new uint256[](length);
        string[] memory descriptions = new string[](length);
        uint256[] memory prices = new uint256[](length);
        string[] memory ipfsHashes = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            ids[i] = availableLicences[i].id;
            descriptions[i] = availableLicences[i].description;
            prices[i] = availableLicences[i].price;
            ipfsHashes[i] = availableLicences[i].ipfsHash;
        }

        return (ids, descriptions, prices, ipfsHashes);
    }

    function getUserLicences(address user) public view returns (uint256[] memory) {
        return _ownerLicenses[user];
    }

    function getLastTransactionTime(address user) public view returns (uint256) {
        return _lastTransactionTime[user];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        require(_exists(tokenId), "Licence inexistante");
        return super.ownerOf(tokenId);
    }

    function getLicenseDetails(uint256 tokenId) public view returns (address, uint256, string memory, uint256, uint256) {
        require(_exists(tokenId), "Licence inexistante");
        LicenseInfo memory license = _licenses[tokenId];
        return (license.owner, license.issuedAt, license.description, license.price, license.licenceTypeId);
    }

    function transferLicence(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "No owner");
        require(_ownerLicenses[to].length < MAX_LICENSES_PER_USER, "Le destinataire a atteint la limite");

        uint256[] storage senderLicenses = _ownerLicenses[msg.sender];
        for (uint256 i = 0; i < senderLicenses.length; i++) {
            if (senderLicenses[i] == tokenId) {
                senderLicenses[i] = senderLicenses[senderLicenses.length - 1];
                senderLicenses.pop();
                break;
            }
        }

        _transfer(msg.sender, to, tokenId);
        _ownerLicenses[to].push(tokenId);

        _licenses[tokenId].owner = to;
        _licenses[tokenId].issuedAt = block.timestamp;
    }
}
