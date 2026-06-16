import {
  Box,
  Button,
  FormField,
  TextInput,
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

export const PropertyFetcherPage = () => {
  const intl = useIntl();
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [addressInput, setAddressInput] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<AIRO.PropertyData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    if (!addressInput.trim()) {
      return;
    }

    setStatus("loading");
    
    // Simulate API fetch delay
    setTimeout(() => {
      const normalizedInput = addressInput.trim().toLowerCase();
      
      // Look for a match (case-insensitive, substring matching for better UX)
      const matchedKey = Object.keys(mockPropertyData).find(
        (key) =>
          key.toLowerCase().includes(normalizedInput) ||
          normalizedInput.includes(key.toLowerCase())
      );

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
    setPropertyDetails(null);
    setIsSubmitted(false);
  };

  const isInputEmpty = isSubmitted && !addressInput.trim();

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
            <form onSubmit={handleSearch}>
              <Rows spacing="2u">
                <FormField
                  label={intl.formatMessage({
                    defaultMessage: "Property Address",
                    description: "Input label for property address",
                  })}
                  error={
                    isInputEmpty &&
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
              </Rows>
            </form>
          )}
        </Rows>
      </Box>
    </Box>
  );
};
