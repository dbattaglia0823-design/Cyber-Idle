const suppliedVehicleArtwork = {
  ...import.meta.glob<string>("../assets/Vehicles/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  ...import.meta.glob<string>("../assets/vehicles/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
};

function normalizedArtworkName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const artworkByName = new Map<string, string>();

Object.entries(suppliedVehicleArtwork).forEach(([path, url]) => {
  const filename = path.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (filename) artworkByName.set(normalizedArtworkName(filename), url);
});

export function vehicleArtworkFor(vehicle: { id: string; name: string }) {
  return artworkByName.get(normalizedArtworkName(vehicle.name))
    ?? artworkByName.get(normalizedArtworkName(vehicle.id));
}

