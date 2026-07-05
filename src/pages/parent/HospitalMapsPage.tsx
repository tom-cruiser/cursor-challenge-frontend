import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  EmptyState,
  HospitalCard,
  HospitalMapView,
  HospitalViewToggle,
  type HospitalViewMode,
} from "@/components/parent";
import { Card, Input } from "@/components/ui";
import { useHospitalWebSocket } from "@/hooks/useHospitalWebSocket";
import {
  filterNearbyHospitals,
  sortHospitalsByDistance,
} from "@/lib/hospital-utils";
import { mapNearbyHospital } from "@/lib/api/mappers";
import * as parentApi from "@/lib/api/parent";
import { config, isApiConfigured } from "@/lib/config";
import { useParentContext } from "@/contexts";
import type { NearbyHospital } from "@/types/hospital";

interface SearchLocation {
  latitude: number;
  longitude: number;
  label: string;
}

function useSearchLocation(): SearchLocation {
  const [location, setLocation] = useState<SearchLocation>(config.defaultLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "your current location",
        });
      },
      () => {
        // Keep Kigali fallback when geolocation is denied or unavailable.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return location;
}

export function HospitalMapsPage() {
  const navigate = useNavigate();
  const searchLocation = useSearchLocation();
  const {
    children,
    activeChild,
    activeChildId,
    setActiveChildId,
    setPreferredHospital,
  } = useParentContext();

  const [viewMode, setViewMode] = useState<HospitalViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [selectedMapHospitalId, setSelectedMapHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await parentApi.getNearbyHospitals(
        searchLocation.latitude,
        searchLocation.longitude,
        { verifiedOnly: false, limit: 20 },
      );
      const mapped = results.map((hospital, index) => mapNearbyHospital(hospital, index));
      setHospitals(mapped);
      setSelectedMapHospitalId(mapped[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hospitals.");
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchLocation.latitude, searchLocation.longitude]);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  useHospitalWebSocket({
    enabled: isApiConfigured(),
    onEvent: () => {
      void loadHospitals();
    },
  });

  const filteredHospitals = useMemo(
    () => sortHospitalsByDistance(filterNearbyHospitals(hospitals, searchQuery)),
    [hospitals, searchQuery],
  );

  const preferredHospitalId = activeChild?.preferredHospitalId ?? null;
  const canSetPreferred = children.length > 0 && Boolean(activeChildId);

  async function handleTogglePreferred(hospitalId: string) {
    if (!activeChildId) {
      return;
    }
    await setPreferredHospital(activeChildId, hospitalId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy">
            Nearby Hospitals
          </h2>
          <p className="mt-1 text-sm text-health-text-muted">
            Find clinics and set a preferred vaccination center for your child.
          </p>
        </div>
        <HospitalViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {children.length === 0 && (
        <Card className="border-teal/20 bg-teal-glow/30 p-4">
          <p className="text-sm text-health-text">
            Add a child profile to set a preferred hospital. You can still browse nearby
            clinics below.
          </p>
          <button
            type="button"
            onClick={() => navigate("/parent/dashboard")}
            className="mt-2 text-sm font-medium text-teal hover:underline"
          >
            Go to Dashboard
          </button>
        </Card>
      )}

      {children.length > 1 && (
        <Card className="p-4">
          <label className="mb-2 block text-sm font-medium text-health-text">
            Select child for preferred hospital
          </label>
          <select
            value={activeChildId ?? ""}
            onChange={(event) => setActiveChildId(event.target.value || null)}
            className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-health-text"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </Card>
      )}

      <Input
        label="Search hospitals"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search by name or address..."
        hint={`Showing hospitals near ${searchLocation.label}`}
      />

      {error && (
        <p className="text-sm text-danger-bright" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-health-text-muted">Loading nearby hospitals...</p>
      ) : filteredHospitals.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hospitals found"
          description="Try widening your search or check back once hospitals register on the platform."
        />
      ) : viewMode === "list" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isPreferred={preferredHospitalId === hospital.id}
              onTogglePreferred={
                canSetPreferred ? () => void handleTogglePreferred(hospital.id) : undefined
              }
              preferredForLabel={activeChild?.name}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <HospitalMapView
            hospitals={filteredHospitals}
            selectedHospitalId={selectedMapHospitalId}
            onSelectHospital={setSelectedMapHospitalId}
            preferredHospitalId={preferredHospitalId}
            locationLabel={searchLocation.label}
          />
          {(filteredHospitals.find((h) => h.id === selectedMapHospitalId) ??
            filteredHospitals[0]) && (
            <HospitalCard
              hospital={
                filteredHospitals.find((h) => h.id === selectedMapHospitalId) ??
                filteredHospitals[0]!
              }
              isPreferred={
                preferredHospitalId ===
                (selectedMapHospitalId ?? filteredHospitals[0]?.id)
              }
              onTogglePreferred={
                canSetPreferred
                  ? () =>
                      void handleTogglePreferred(
                        selectedMapHospitalId ?? filteredHospitals[0]!.id,
                      )
                  : undefined
              }
              preferredForLabel={activeChild?.name}
            />
          )}
        </div>
      )}
    </div>
  );
}
