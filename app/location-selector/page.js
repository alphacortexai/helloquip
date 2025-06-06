"use client";

import { useEffect, useState } from "react";

export default function LocationSelector() {
  const [districts, setDistricts] = useState([]);
  const [counties, setCounties] = useState([]);
  const [subCounties, setSubCounties] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selected, setSelected] = useState({
    district: "",
    county: "",
    subCounty: "",
    parish: "",
    village: "",
  });

  // Fetch districts on mount, **with level=district**
  useEffect(() => {
    fetch("/api/ug-location?level=districts")
      .then((res) => res.json())
      .then((json) => {
        console.log("Districts fetched:", json);
        // Assuming json is an array of districts, adjust if needed
        setDistricts(json);
      })
      .catch((err) => {
        console.error("Failed to load districts:", err);
      });
  }, []);

  // Fetch counties when district changes
  useEffect(() => {
    if (!selected.district) {
      setCounties([]);
      return;
    }
    fetch(`/api/ug-location?level=counties&parentId=${selected.district}`)
      .then((res) => res.json())
      .then(setCounties)
      .catch(console.error);

    setSelected((s) => ({ ...s, county: "", subCounty: "", parish: "", village: "" }));
    setSubCounties([]);
    setParishes([]);
    setVillages([]);
  }, [selected.district]);

  // Fetch subCounties when county changes
  useEffect(() => {
    if (!selected.county) {
      setSubCounties([]);
      return;
    }
    fetch(`/api/ug-location?level=subCounties&parentId=${selected.county}`)
      .then((res) => res.json())
      .then(setSubCounties)
      .catch(console.error);

    setSelected((s) => ({ ...s, subCounty: "", parish: "", village: "" }));
    setParishes([]);
    setVillages([]);
  }, [selected.county]);

  // Fetch parishes when subCounty changes
  useEffect(() => {
    if (!selected.subCounty) {
      setParishes([]);
      return;
    }
    fetch(`/api/ug-location?level=parishes&parentId=${selected.subCounty}`)
      .then((res) => res.json())
      .then(setParishes)
      .catch(console.error);

    setSelected((s) => ({ ...s, parish: "", village: "" }));
    setVillages([]);
  }, [selected.subCounty]);

  // Fetch villages when parish changes
  useEffect(() => {
    if (!selected.parish) {
      setVillages([]);
      return;
    }
    fetch(`/api/ug-location?level=villages&parentId=${selected.parish}`)
      .then((res) => res.json())
      .then(setVillages)
      .catch(console.error);

    setSelected((s) => ({ ...s, village: "" }));
  }, [selected.parish]);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-center">Select Your Location</h2>

      <Select
        label="District"
        value={selected.district}
        onChange={(e) => setSelected((s) => ({ ...s, district: e.target.value }))}
        options={districts}
      />

      <Select
        label="County"
        value={selected.county}
        onChange={(e) => setSelected((s) => ({ ...s, county: e.target.value }))}
        options={counties}
        disabled={!selected.district}
      />

      <Select
        label="Sub-county"
        value={selected.subCounty}
        onChange={(e) => setSelected((s) => ({ ...s, subCounty: e.target.value }))}
        options={subCounties}
        disabled={!selected.county}
      />

      <Select
        label="Parish"
        value={selected.parish}
        onChange={(e) => setSelected((s) => ({ ...s, parish: e.target.value }))}
        options={parishes}
        disabled={!selected.subCounty}
      />

      <Select
        label="Village"
        value={selected.village}
        onChange={(e) => setSelected((s) => ({ ...s, village: e.target.value }))}
        options={villages}
        disabled={!selected.parish}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 border rounded-md ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
