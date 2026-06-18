import {
  Box,
  Button,
  FormField,
  TextInput,
  Select,
  LoadingIndicator,
  Alert,
  Text,
  Title,
  Grid,
  Rows,
  Columns,
  Column,
  SearchIcon,
} from "@canva/app-ui-kit";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import type { AIRO } from "../../types";
import { PropertyMap } from "./PropertyMap";

type SearchStatus = "idle" | "loading" | "success" | "error";
type SearchMode = "single" | "chunked";

const stateOptions = [
  { value: "NSW", label: "NSW (New South Wales)" },
  { value: "VIC", label: "VIC (Victoria)" },
  { value: "QLD", label: "QLD (Queensland)" },
  { value: "WA", label: "WA (Western Australia)" },
  { value: "SA", label: "SA (South Australia)" },
  { value: "TAS", label: "TAS (Tasmania)" },
  { value: "ACT", label: "ACT (Australian Capital Territory)" },
  { value: "NT", label: "NT (Northern Territory)" },
];

const DOMAIN_API_BASE_URL = "https://api.domain.com.au";
// const MOCK_TOKEN = process.env.DOMAIN_API_KEY || "MOCK_DOMAIN_API_TOKEN"; // This would typically come from an environment variable or auth flow
const MOCK_TOKEN = "MOCK_DOMAIN_API_TOKEN"; // This would typically come from an environment variable or auth flow

interface DomainSuggestion {
  id: string;
  relativeScore: number;
}

interface DomainPropertyDetails {
  address: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  areaSize: number;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export const PropertyFetcherPage = () => {
  const intl = useIntl();
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [searchMode, setSearchMode] = useState<SearchMode>("single");

  // Single input state
  const [addressInput, setAddressInput] = useState<string>("");

  // Chunked input states
  const [streetAddressInput, setStreetAddressInput] = useState<string>("");
  const [suburbInput, setSuburbInput] = useState<string>("");
  const [stateInput, setStateInput] = useState<string>("NSW");
  const [postcodeInput, setPostcodeInput] = useState<string>("");

  const [propertyDetails, setPropertyDetails] =
    useState<AIRO.PropertyData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchPropertySuggestion = async (
    addressString: string,
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `${DOMAIN_API_BASE_URL}/v1/properties/_suggest?terms=${encodeURIComponent(addressString)}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": MOCK_TOKEN,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Suggestion API failed with status: ${response.status}`,
        );
      }

      const data: DomainSuggestion[] = await response.json();
      if (data && data.length > 0) {
        return data[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching property suggestion:", error);
      return null;
    }
  };

  const getPropertyDetails = async (
    id: string,
  ): Promise<AIRO.PropertyData | null> => {
    try {
      const response = await fetch(
        `${DOMAIN_API_BASE_URL}/v1/properties/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": MOCK_TOKEN,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Property Details API failed with status: ${response.status}`,
        );
      }

      const data: DomainPropertyDetails = await response.json();
      return {
        address: data.address,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        carSpaces: data.carSpaces,
        areaSize: data.areaSize,
        latitude: data.geolocation?.latitude,
        longitude: data.geolocation?.longitude,
      };
    } catch (error) {
      console.error("Error fetching property details:", error);
      return null;
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    let searchQuery = "";
    if (searchMode === "single") {
      if (!addressInput.trim()) {
        return;
      }
      searchQuery = addressInput.trim();
    } else {
      if (!streetAddressInput.trim() || !suburbInput.trim()) {
        return;
      }
      searchQuery =
        `${streetAddressInput.trim()}, ${suburbInput.trim()} ${stateInput} ${postcodeInput.trim()}`.trim();
    }

    setStatus("loading");

    try {
      const propertyId = await fetchPropertySuggestion(searchQuery);

      if (propertyId) {
        const details = await getPropertyDetails(propertyId);
        if (details) {
          setPropertyDetails(details);
          if (details.latitude && details.longitude) {
            setSelectedCoordinates({
              lat: details.latitude,
              lng: details.longitude,
            });
          }
          setStatus("success");
          return;
        }
      }

      setPropertyDetails(null);
      setStatus("error");
    } catch (error) {
      console.error("Search workflow failed:", error);
      setPropertyDetails(null);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setAddressInput("");
    setStreetAddressInput("");
    setSuburbInput("");
    setStateInput("NSW");
    setPostcodeInput("");
    setPropertyDetails(null);
    setIsSubmitted(false);
    setSelectedCoordinates(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoordinates({ lat, lng });
    // Future enhancement: trigger reverse geocode lookup here to populate addressInput
  };

  const isSingleInputEmpty =
    isSubmitted && searchMode === "single" && !addressInput.trim();
  const isStreetEmpty =
    isSubmitted && searchMode === "chunked" && !streetAddressInput.trim();
  const isSuburbEmpty =
    isSubmitted && searchMode === "chunked" && !suburbInput.trim();

  return (
    <Box paddingY="2u" height="full">
      <Box
        height="full"
        display="flex"
        flexDirection="column"
        justifyContent="spaceBetween"
      >
        <Rows spacing="2u">
          {/* Header */}
          <Rows spacing="0.5u">
            <Title size="medium">
              {intl.formatMessage({
                defaultMessage: "Property Feature Fetcher",
                description: "Title of the property fetcher application",
              })}
            </Title>
            <Text tone="secondary" size="small">
              {intl.formatMessage({
                defaultMessage:
                  "Enter a property address to instantly fetch and view its bedrooms, bathrooms, car spaces, and size.",
                description: "Description text guiding real estate agents",
              })}
            </Text>
          </Rows>

          {/* Workflow State Content */}
          {status === "loading" && (
            <Box
              paddingY="4u"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Rows spacing="1.5u" align="center">
                <LoadingIndicator size="medium" />
                <Text tone="secondary" size="small">
                  {intl.formatMessage({
                    defaultMessage: "Searching Domain database...",
                    description: "Loading text while fetching property details",
                  })}
                </Text>
              </Rows>
            </Box>
          )}

          {status === "error" && (
            <Rows spacing="2u">
              <Alert
                tone="critical"
                title={intl.formatMessage({
                  defaultMessage: "Property Not Found",
                  description: "Error alert title when address fetch fails",
                })}
              >
                {intl.formatMessage({
                  defaultMessage:
                    "We couldn't resolve this address. Check your API permissions or try another property.",
                  description: "Error message details",
                })}
              </Alert>
              <Button variant="secondary" stretch onClick={handleReset}>
                {intl.formatMessage({
                  defaultMessage: "Try Another Search",
                  description: "Button text to reset from error state",
                })}
              </Button>
            </Rows>
          )}

          {status === "success" && propertyDetails && (
            <Rows spacing="2u">
              {/* Found Address Header */}
              <Box
                background="neutralSubtle"
                borderRadius="standard"
                padding="1.5u"
              >
                <Rows spacing="0.5u">
                  <Text size="xsmall" tone="secondary">
                    {intl.formatMessage({
                      defaultMessage: "RESOLVED ADDRESS",
                      description: "Label for resolved address header",
                    })}
                  </Text>
                  <Text size="medium" variant="bold">
                    {propertyDetails.address}
                  </Text>
                </Rows>
              </Box>

              {/* Attributes Display Grid */}
              <Grid columns={2} spacing="1.5u">
                {/* Bedrooms */}
                <Box
                  background="neutral"
                  borderRadius="standard"
                  padding="1.5u"
                >
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Bedrooms",
                        description: "Label for bedroom count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.bedrooms?.toString() || "-"}
                    </Text>
                  </Rows>
                </Box>

                {/* Bathrooms */}
                <Box
                  background="neutral"
                  borderRadius="standard"
                  padding="1.5u"
                >
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Bathrooms",
                        description: "Label for bathroom count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.bathrooms?.toString() || "-"}
                    </Text>
                  </Rows>
                </Box>

                {/* Car Spaces */}
                <Box
                  background="neutral"
                  borderRadius="standard"
                  padding="1.5u"
                >
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Car Spaces",
                        description: "Label for car space count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.carSpaces?.toString() || "-"}
                    </Text>
                  </Rows>
                </Box>

                {/* Property Size */}
                <Box
                  background="neutral"
                  borderRadius="standard"
                  padding="1.5u"
                >
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Property Size",
                        description: "Label for area size in square meters",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.areaSize
                        ? `${propertyDetails.areaSize} m²`
                        : "-"}
                    </Text>
                  </Rows>
                </Box>
              </Grid>

              {/* Actions */}
              <Button variant="secondary" stretch onClick={handleReset}>
                {intl.formatMessage({
                  defaultMessage: "Search Another Address",
                  description: "Button text to search again after success",
                })}
              </Button>
            </Rows>
          )}

          {status === "idle" && (
            <Rows spacing="2u">
              {searchMode === "single" ? (
                /* Single Address Line Form */
                <form onSubmit={handleSearch}>
                  <Rows spacing="2u">
                    <FormField
                      label={intl.formatMessage({
                        defaultMessage: "Property Address",
                        description: "Input label for property address",
                      })}
                      error={
                        isSingleInputEmpty &&
                        intl.formatMessage({
                          defaultMessage: "Please enter an address to search",
                          description:
                            "Validation error for empty address input",
                        })
                      }
                      control={(props) => (
                        <TextInput
                          {...props}
                          placeholder={intl.formatMessage({
                            defaultMessage:
                              "e.g. 123 Ocean View Drive, Beachside",
                            description: "Placeholder text for address input",
                          })}
                          value={addressInput}
                          onChange={setAddressInput}
                          start={<SearchIcon />}
                        />
                      )}
                    />
                    <Button variant="primary" stretch type="submit">
                      {intl.formatMessage({
                        defaultMessage: "Fetch Property Details",
                        description: "Button text to query property details",
                      })}
                    </Button>
                    <Button
                      variant="secondary"
                      stretch
                      type="button"
                      onClick={() => {
                        setSearchMode("chunked");
                        setIsSubmitted(false);
                      }}
                    >
                      {intl.formatMessage({
                        defaultMessage: "Search by Address Fields",
                        description: "Button to switch to detailed fields form",
                      })}
                    </Button>
                  </Rows>
                </form>
              ) : (
                /* Chunked Detailed Address Fields Form */
                <form onSubmit={handleSearch}>
                  <Rows spacing="1.5u">
                    <FormField
                      label={intl.formatMessage({
                        defaultMessage: "Street Address",
                        description: "Input label for street address component",
                      })}
                      error={
                        isStreetEmpty &&
                        intl.formatMessage({
                          defaultMessage: "Please enter a street address",
                          description: "Validation error for street address",
                        })
                      }
                      control={(props) => (
                        <TextInput
                          {...props}
                          placeholder={intl.formatMessage({
                            defaultMessage: "e.g. 123 Ocean View Drive",
                            description: "Placeholder text for street address",
                          })}
                          value={streetAddressInput}
                          onChange={setStreetAddressInput}
                        />
                      )}
                    />

                    <FormField
                      label={intl.formatMessage({
                        defaultMessage: "Suburb",
                        description: "Input label for suburb address component",
                      })}
                      error={
                        isSuburbEmpty &&
                        intl.formatMessage({
                          defaultMessage: "Please enter a suburb",
                          description: "Validation error for suburb",
                        })
                      }
                      control={(props) => (
                        <TextInput
                          {...props}
                          placeholder={intl.formatMessage({
                            defaultMessage: "e.g. Beachside",
                            description: "Placeholder text for suburb",
                          })}
                          value={suburbInput}
                          onChange={setSuburbInput}
                        />
                      )}
                    />

                    <Columns spacing="1.5u">
                      <Column width="1/2">
                        <FormField
                          label={intl.formatMessage({
                            defaultMessage: "State",
                            description:
                              "Dropdown label for Australian state component",
                          })}
                          control={(props) => (
                            <Select
                              {...props}
                              stretch
                              options={stateOptions}
                              value={stateInput}
                              onChange={setStateInput}
                            />
                          )}
                        />
                      </Column>
                      <Column width="1/2">
                        <FormField
                          label={intl.formatMessage({
                            defaultMessage: "Postcode",
                            description: "Input label for postcode component",
                          })}
                          control={(props) => (
                            <TextInput
                              {...props}
                              placeholder="e.g. 2000"
                              value={postcodeInput}
                              onChange={setPostcodeInput}
                            />
                          )}
                        />
                      </Column>
                    </Columns>

                    <Box paddingTop="1u">
                      <Rows spacing="1.5u">
                        <Button variant="primary" stretch type="submit">
                          {intl.formatMessage({
                            defaultMessage: "Fetch Property Details",
                            description:
                              "Button text to query property details",
                          })}
                        </Button>
                        <Button
                          variant="secondary"
                          stretch
                          type="button"
                          onClick={() => {
                            setSearchMode("single");
                            setIsSubmitted(false);
                          }}
                        >
                          {intl.formatMessage({
                            defaultMessage: "Search by Single Address Line",
                            description:
                              "Button to switch back to single address input",
                          })}
                        </Button>
                      </Rows>
                    </Box>
                  </Rows>
                </form>
              )}
            </Rows>
          )}

          {/* Interactive Leaflet Map */}
          <Box paddingTop="2u">
            <PropertyMap
              latitude={selectedCoordinates?.lat}
              longitude={selectedCoordinates?.lng}
              onMapClick={handleMapClick}
            />
          </Box>
        </Rows>
      </Box>
    </Box>
  );
};
