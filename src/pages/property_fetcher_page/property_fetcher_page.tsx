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
import { AIRO } from "../../types";

// Mock property data representing Domain API structure
const mockPropertyData: Record<string, AIRO.PropertyData> = {
  "123 Ocean View Drive, Beachside": {
    address: "123 Ocean View Drive, Beachside",
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    areaSize: 350,
  },
  "45 Mountain Road, Highland Park": {
    address: "45 Mountain Road, Highland Park",
    bedrooms: 5,
    bathrooms: 4,
    carSpaces: 3,
    areaSize: 520,
  },
  "789 City Center Ave, Downtown": {
    address: "789 City Center Ave, Downtown",
    bedrooms: 2,
    bathrooms: 2,
    carSpaces: 1,
    areaSize: 95,
  },
};

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

  const [propertyDetails, setPropertyDetails] = useState<AIRO.PropertyData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    if (searchMode === "single") {
      if (!addressInput.trim()) {
        return;
      }
    } else {
      if (!streetAddressInput.trim() || !suburbInput.trim()) {
        return;
      }
    }

    setStatus("loading");

    setTimeout(() => {
      let matchedKey: string | undefined;

      if (searchMode === "single") {
        const normalizedInput = addressInput.trim().toLowerCase();
        matchedKey = Object.keys(mockPropertyData).find(
          (key) =>
            key.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(key.toLowerCase())
        );
      } else {
        const streetLower = streetAddressInput.trim().toLowerCase();
        const suburbLower = suburbInput.trim().toLowerCase();

        // Search by verifying both street and suburb exist in the mock data key
        matchedKey = Object.keys(mockPropertyData).find((key) => {
          const keyLower = key.toLowerCase();
          return keyLower.includes(streetLower) && keyLower.includes(suburbLower);
        });
      }

      if (matchedKey) {
        setPropertyDetails(mockPropertyData[matchedKey]);
        setStatus("success");
      } else {
        setPropertyDetails(null);
        setStatus("error");
      }
    }, 1200);
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
  };

  const isSingleInputEmpty = isSubmitted && searchMode === "single" && !addressInput.trim();
  const isStreetEmpty = isSubmitted && searchMode === "chunked" && !streetAddressInput.trim();
  const isSuburbEmpty = isSubmitted && searchMode === "chunked" && !suburbInput.trim();

  return (
    <Box paddingY="2u" height="full">
      <Box height="full" display="flex" flexDirection="column" justifyContent="spaceBetween">
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
            <Box paddingY="4u" display="flex" justifyContent="center" alignItems="center">
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
                    "We couldn't resolve this address. For testing, try using: '123 Ocean View Drive' or '45 Mountain Road'.",
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
              <Box background="neutralSubtle" borderRadius="standard" padding="1.5u">
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
                <Box background="neutral" borderRadius="standard" padding="1.5u">
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Bedrooms",
                        description: "Label for bedroom count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.bedrooms.toString()}
                    </Text>
                  </Rows>
                </Box>

                {/* Bathrooms */}
                <Box background="neutral" borderRadius="standard" padding="1.5u">
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Bathrooms",
                        description: "Label for bathroom count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.bathrooms.toString()}
                    </Text>
                  </Rows>
                </Box>

                {/* Car Spaces */}
                <Box background="neutral" borderRadius="standard" padding="1.5u">
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Car Spaces",
                        description: "Label for car space count",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {propertyDetails.carSpaces.toString()}
                    </Text>
                  </Rows>
                </Box>

                {/* Property Size */}
                <Box background="neutral" borderRadius="standard" padding="1.5u">
                  <Rows spacing="0.5u">
                    <Text size="xsmall" tone="secondary">
                      {intl.formatMessage({
                        defaultMessage: "Property Size",
                        description: "Label for area size in square meters",
                      })}
                    </Text>
                    <Text size="large" variant="bold">
                      {`${propertyDetails.areaSize} m²`}
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
                          description: "Validation error for empty address input",
                        })
                      }
                      control={(props) => (
                        <TextInput
                          {...props}
                          placeholder={intl.formatMessage({
                            defaultMessage: "e.g. 123 Ocean View Drive, Beachside",
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
                    <Button variant="secondary" stretch type="button" onClick={() => { setSearchMode("chunked"); setIsSubmitted(false); }}>
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
                            description: "Dropdown label for Australian state component",
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
                            description: "Button text to query property details",
                          })}
                        </Button>
                        <Button variant="secondary" stretch type="button" onClick={() => { setSearchMode("single"); setIsSubmitted(false); }}>
                          {intl.formatMessage({
                            defaultMessage: "Search by Single Address Line",
                            description: "Button to switch back to single address input",
                          })}
                        </Button>
                      </Rows>
                    </Box>
                  </Rows>
                </form>
              )}
            </Rows>
          )}
        </Rows>
      </Box>
    </Box>
  );
};
