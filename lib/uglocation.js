// // lib/ugLocation.js
// const UgaLocale = require("ug-locale")();

// function getLocationData(districtId = "42") {
//   const district = UgaLocale.districts().find((d) => d.id === districtId);
//   const counties = UgaLocale.counties(district?.id || "");
//   const subCounties = UgaLocale.subCounties(counties[0]?.id || "");
//   const parishes = UgaLocale.parishes(subCounties[0]?.id || "");
//   const villages = UgaLocale.villages(parishes[0]?.id || "");

//   return {
//     district,
//     counties,
//     subCounties,
//     parishes,
//     villages,
//   };
// }

// module.exports = { getLocationData };



const UgaLocale = require("ug-locale")();

function getLocations(level, parentId) {
  switch (level) {
    case "districts":
      return UgaLocale.districts();

    case "counties":
      if (!parentId) return [];
      return UgaLocale.counties(parentId);

    case "subCounties":
      if (!parentId) return [];
      return UgaLocale.subCounties(parentId);

    case "parishes":
      if (!parentId) return [];
      return UgaLocale.parishes(parentId);

    case "villages":
      if (!parentId) return [];
      return UgaLocale.villages(parentId);

    default:
      return [];
  }
}

module.exports = { getLocations };
