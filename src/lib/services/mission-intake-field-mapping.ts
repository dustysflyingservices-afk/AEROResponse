import { buildFieldMapFromAliases } from "@/lib/services/roster-field-mapping";

const MISSION_INTAKE_ALIASES: Record<string, string[]> = {
  firstName: ["firstname", "first"],
  lastName: ["lastname", "last"],
  fullName: ["name", "requestername", "contactname"],
  email: ["email", "emailaddress", "e-mail"],
  phone: ["phone", "phonenumber", "cell", "mobile", "cellphone"],
  street1: ["streetaddress", "address", "street"],
  street2: ["streetaddressline2", "address2", "addressline2"],
  city: ["city"],
  state: ["state", "stateprovince", "province"],
  zipCode: ["postalzipcode", "zipcode", "zip", "postalcode"],
  flightDate: ["dateofflight", "flightdate"],
  returningFlight: ["returningflight"],
  returnDate: ["ifyesdateofreturningflight", "returningflightdate", "returndate"],
  area: ["areainwhichflightisneeded", "areaneeded", "flightpurpose", "area"],
  description: [
    "descriptionofflightrequestifapplicable",
    "descriptionofflightrequest",
    "flightrequestdescription",
    "description",
  ],
};

export function buildMissionIntakeFieldMap(labels: string[]): Record<string, string> {
  return buildFieldMapFromAliases(labels, MISSION_INTAKE_ALIASES);
}
