import { FormSchema } from "@/form-builder/types"
import { localFormRepository, cloneSchemaWithNewIds } from "@/lib/repositories/LocalFormRepository"

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  category: "Agriculture" | "Livestock" | "Field Operations" | "Inspections" | "Farm Management"
  fieldCount: number
  schema: FormSchema
}

// 1. Farm Inspection Template
const farmInspectionSchema: FormSchema = {
  id: "template_farm_inspection",
  name: "Farm Inspection",
  description: "Inspect farm environmental conditions, crop health, plot surface area calculation, pest presence, and irrigation.",
  version: 1,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  fields: [
    {
      id: "fi_farm_name",
      type: "text",
      label: "Farm Name",
      description: "Name of registered farm or agricultural plot",
      required: true,
      placeholder: "e.g. Green Valley Farm",
    },
    {
      id: "fi_inspector_name",
      type: "text",
      label: "Inspector Name",
      description: "Full name of field inspector",
      required: true,
      placeholder: "e.g. John Doe",
    },
    {
      id: "fi_inspection_date",
      type: "date",
      label: "Inspection Date",
      description: "Date inspection was conducted",
      required: true,
    },
    {
      id: "fi_crop_type",
      type: "dropdown",
      label: "Primary Crop Type",
      description: "Main crop cultivated on this block",
      required: true,
      settings: {
        placeholder: "Select crop category...",
        options: [
          { id: "opt_maize", label: "Maize / Corn", value: "maize" },
          { id: "opt_wheat", label: "Wheat", value: "wheat" },
          { id: "opt_coffee", label: "Coffee", value: "coffee" },
          { id: "opt_tea", label: "Tea", value: "tea" },
          { id: "opt_soybeans", label: "Soybeans", value: "soybeans" },
        ],
      },
    },
    {
      id: "fi_plot_length",
      type: "number",
      label: "Plot Length",
      description: "Length of plot in meters",
      required: false,
      placeholder: "20",
    },
    {
      id: "fi_plot_width",
      type: "number",
      label: "Plot Width",
      description: "Width of plot in meters",
      required: false,
      placeholder: "10",
    },
    {
      id: "fi_total_area",
      type: "calculated",
      label: "Total Area",
      description: "Automatically calculated plot surface area (Length × Width)",
      required: false,
      calculation: {
        enabled: true,
        expression: "[fi_plot_length] * [fi_plot_width]",
        unit: "sq m",
      },
    },
    {
      id: "fi_pest_detected",
      type: "yes_no",
      label: "Pest Presence Detected?",
      description: "Are there active signs of pest damage or infestation?",
      required: true,
      settings: {
        yesLabel: "Pests Detected",
        noLabel: "Clean Plot",
      },
    },
    {
      id: "fi_pest_notes",
      type: "paragraph",
      label: "Pest Infestation Details",
      description: "Describe pest species, affected crop area, and severity",
      required: false,
      logic: {
        enabled: true,
        action: "show",
        group: "all",
        conditions: [
          {
            id: "c_pest",
            fieldId: "fi_pest_detected",
            operator: "equals",
            value: true,
          },
        ],
      },
    },
    {
      id: "fi_summary_notes",
      type: "paragraph",
      label: "Inspector Summary Notes",
      description: "General summary and recommendations for farm operator",
      required: false,
    },
  ],
}

// 2. Crop Survey Template
const cropSurveySchema: FormSchema = {
  id: "template_crop_survey",
  name: "Crop Survey",
  description: "Comprehensive survey of crop variety, planting dates, growth stages, and calculated total harvest yield.",
  version: 1,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  fields: [
    {
      id: "cs_farmer_name",
      type: "text",
      label: "Farmer Name",
      description: "Registered head of household / farmer",
      required: true,
    },
    {
      id: "cs_crop_type",
      type: "dropdown",
      label: "Crop Type",
      description: "Specified crop category",
      required: true,
      settings: {
        placeholder: "Select crop...",
        options: [
          { id: "opt_corn", label: "Corn / Maize", value: "corn" },
          { id: "opt_wheat", label: "Wheat", value: "wheat" },
          { id: "opt_rice", label: "Rice", value: "rice" },
          { id: "opt_cassava", label: "Cassava", value: "cassava" },
          { id: "opt_sorghum", label: "Sorghum", value: "sorghum" },
        ],
      },
    },
    {
      id: "cs_variety",
      type: "text",
      label: "Seed Variety / Hybrid",
      description: "Specify seed variety identifier",
      required: false,
    },
    {
      id: "cs_planting_date",
      type: "date",
      label: "Planting Date",
      description: "Date seeds were sown",
      required: true,
    },
    {
      id: "cs_area_hectares",
      type: "number",
      label: "Cultivated Area (Hectares)",
      description: "Total area dedicated to crop",
      required: true,
      placeholder: "15",
    },
    {
      id: "cs_yield_per_ha",
      type: "number",
      label: "Estimated Yield per Hectare",
      description: "Expected harvest yield in metric tons",
      required: false,
      placeholder: "4",
    },
    {
      id: "cs_total_yield",
      type: "calculated",
      label: "Total Expected Harvest Yield",
      description: "Calculated total production output (Hectares × Yield per Ha)",
      required: false,
      calculation: {
        enabled: true,
        expression: "[cs_area_hectares] * [cs_yield_per_ha]",
        unit: "tons",
      },
    },
    {
      id: "cs_growth_stage",
      type: "radio",
      label: "Current Growth Stage",
      description: "Phenological stage of the crop",
      required: true,
      settings: {
        options: [
          { id: "opt_seedling", label: "Germination / Seedling", value: "seedling" },
          { id: "opt_vegetative", label: "Vegetative Stage", value: "vegetative" },
          { id: "opt_flowering", label: "Flowering / Grain Filling", value: "flowering" },
          { id: "opt_mature", label: "Mature / Ready for Harvest", value: "mature" },
        ],
      },
    },
    {
      id: "cs_notes",
      type: "paragraph",
      label: "Surveyor Field Notes",
      description: "General comments regarding weather impacts or soil health",
      required: false,
    },
  ],
}

// 3. Livestock Registration Template
const livestockSchema: FormSchema = {
  id: "template_livestock",
  name: "Livestock Registration",
  description: "Register livestock animals, breeds, health status, and repeat group records.",
  version: 1,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  fields: [
    {
      id: "ls_facility_name",
      type: "text",
      label: "Ranch / Facility Name",
      description: "Name of livestock holding facility",
      required: true,
    },
    {
      id: "ls_reg_date",
      type: "date",
      label: "Registration Date",
      description: "Date of census",
      required: true,
    },
    {
      id: "ls_repeat_group",
      type: "repeat_group",
      label: "Livestock Records",
      description: "Add entries for individual animals or herds",
      required: false,
      settings: {
        addItemLabel: "Animal Herd",
        minItems: 1,
        maxItems: 10,
        allowRemove: true,
        childFields: [
          {
            id: "ls_species",
            type: "dropdown",
            label: "Animal Species",
            description: "Category of livestock animal",
            required: true,
            settings: {
              placeholder: "Select species...",
              options: [
                { id: "opt_bovine", label: "Cattle (Bovine)", value: "bovine" },
                { id: "opt_goat", label: "Goat (Caprine)", value: "goat" },
                { id: "opt_sheep", label: "Sheep (Ovine)", value: "sheep" },
                { id: "opt_poultry", label: "Poultry", value: "poultry" },
                { id: "opt_swine", label: "Swine / Pig", value: "swine" },
              ],
            },
          },
          {
            id: "ls_head_count",
            type: "number",
            label: "Head Count",
            description: "Number of animals in herd",
            required: true,
          },
          {
            id: "ls_vaccination",
            type: "radio",
            label: "Vaccination Status",
            description: "Immunization record status",
            required: true,
            settings: {
              options: [
                { id: "opt_vac_full", label: "Fully Vaccinated", value: "vaccinated" },
                { id: "opt_vac_pending", label: "Pending Vaccination", value: "pending" },
                { id: "opt_vac_none", label: "Not Vaccinated", value: "unvaccinated" },
              ],
            },
          },
        ],
      },
    },
    {
      id: "ls_veterinarian_notes",
      type: "paragraph",
      label: "Veterinary Notes",
      description: "Observations regarding disease prevention or feed quality",
      required: false,
    },
    {
      id: "ls_contact_phone",
      type: "phone",
      label: "Facility Contact Phone",
      description: "Phone number of ranch manager",
      required: false,
    },
  ],
}

// 4. Field Visit Template
const fieldVisitSchema: FormSchema = {
  id: "template_field_visit",
  name: "Field Visit Report",
  description: "Record agricultural officer visits, observations, recommendations, and follow-up actions.",
  version: 1,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  fields: [
    {
      id: "fv_officer",
      type: "text",
      label: "Extension Officer Name",
      description: "Name of visiting officer",
      required: true,
    },
    {
      id: "fv_farmer",
      type: "text",
      label: "Farmer / Host Name",
      description: "Name of visited farmer",
      required: true,
    },
    {
      id: "fv_visit_date",
      type: "date",
      label: "Visit Date",
      description: "Date of field visit",
      required: true,
    },
    {
      id: "fv_purpose",
      type: "dropdown",
      label: "Visit Purpose",
      description: "Primary objective of visit",
      required: true,
      settings: {
        placeholder: "Select visit purpose...",
        options: [
          { id: "opt_routine", label: "Routine Agronomic Check", value: "routine" },
          { id: "opt_emergency", label: "Pest / Disease Emergency Response", value: "emergency" },
          { id: "opt_audit", label: "Input Distribution Audit", value: "audit" },
          { id: "opt_harvest", label: "Harvest Verification", value: "harvest" },
        ],
      },
    },
    {
      id: "fv_observations",
      type: "paragraph",
      label: "Field Observations & Findings",
      description: "Summary of observed field conditions",
      required: true,
    },
    {
      id: "fv_followup_needed",
      type: "yes_no",
      label: "Follow-up Visit Required?",
      description: "Does this plot require a secondary visit?",
      required: true,
      settings: {
        yesLabel: "Yes - Follow-up Required",
        noLabel: "No - Complete",
      },
    },
    {
      id: "fv_followup_date",
      type: "date",
      label: "Target Follow-up Date",
      description: "Scheduled date for return visit",
      required: false,
      logic: {
        enabled: true,
        action: "show",
        group: "all",
        conditions: [
          {
            id: "c_fv_fu",
            fieldId: "fv_followup_needed",
            operator: "equals",
            value: true,
          },
        ],
      },
    },
  ],
}

// 5. Input Distribution Template
const inputDistributionSchema: FormSchema = {
  id: "template_input_distribution",
  name: "Input Distribution Log",
  description: "Track distribution of seeds and fertilizers with cost calculations.",
  version: 1,
  createdAt: "2026-08-01T08:00:00.000Z",
  updatedAt: "2026-08-01T08:00:00.000Z",
  fields: [
    {
      id: "id_recipient",
      type: "text",
      label: "Recipient Farmer Name",
      description: "Full legal name of beneficiary",
      required: true,
    },
    {
      id: "id_date",
      type: "date",
      label: "Distribution Date",
      description: "Date of item handover",
      required: true,
    },
    {
      id: "id_item_type",
      type: "dropdown",
      label: "Input Package Description",
      description: "Distributed agricultural item",
      required: true,
      settings: {
        placeholder: "Select input package...",
        options: [
          { id: "opt_seed", label: "Certified Maize Seed (25kg)", value: "maize_seed" },
          { id: "opt_npk", label: "NPK Fertilizer (50kg)", value: "npk_fertilizer" },
          { id: "opt_drip", label: "Drip Irrigation Kit", value: "drip_kit" },
          { id: "opt_sprayer", label: "Knapsack Sprayer", value: "sprayer" },
        ],
      },
    },
    {
      id: "id_quantity",
      type: "number",
      label: "Quantity Delivered",
      description: "Number of units issued",
      required: true,
      placeholder: "5",
    },
    {
      id: "id_unit_price",
      type: "number",
      label: "Subsidized Unit Price ($)",
      description: "Unit cost per package",
      required: false,
      placeholder: "30",
    },
    {
      id: "id_total_cost",
      type: "calculated",
      label: "Total Package Value ($)",
      description: "Calculated total value of distributed input (Quantity × Unit Price)",
      required: false,
      calculation: {
        enabled: true,
        expression: "[id_quantity] * [id_unit_price]",
        unit: "$",
      },
    },
    {
      id: "id_verified",
      type: "yes_no",
      label: "Recipient ID Verified?",
      description: "Confirm identity document was inspected",
      required: true,
      settings: {
        yesLabel: "ID Verified",
        noLabel: "Unverified",
      },
    },
    {
      id: "id_contact_email",
      type: "email",
      label: "Confirmation Email Address",
      description: "Beneficiary notification email",
      required: false,
    },
  ],
}

export const staticTemplates: TemplateDefinition[] = [
  {
    id: farmInspectionSchema.id,
    name: farmInspectionSchema.name,
    description: farmInspectionSchema.description,
    category: "Inspections",
    fieldCount: farmInspectionSchema.fields.length,
    schema: farmInspectionSchema,
  },
  {
    id: cropSurveySchema.id,
    name: cropSurveySchema.name,
    description: cropSurveySchema.description,
    category: "Agriculture",
    fieldCount: cropSurveySchema.fields.length,
    schema: cropSurveySchema,
  },
  {
    id: livestockSchema.id,
    name: livestockSchema.name,
    description: livestockSchema.description,
    category: "Livestock",
    fieldCount: livestockSchema.fields.length,
    schema: livestockSchema,
  },
  {
    id: fieldVisitSchema.id,
    name: fieldVisitSchema.name,
    description: fieldVisitSchema.description,
    category: "Field Operations",
    fieldCount: fieldVisitSchema.fields.length,
    schema: fieldVisitSchema,
  },
  {
    id: inputDistributionSchema.id,
    name: inputDistributionSchema.name,
    description: inputDistributionSchema.description,
    category: "Farm Management",
    fieldCount: inputDistributionSchema.fields.length,
    schema: inputDistributionSchema,
  },
]

export class TemplateRepository {
  getTemplates(): TemplateDefinition[] {
    return staticTemplates
  }

  getTemplate(id: string): TemplateDefinition | null {
    return staticTemplates.find((t) => t.id === id) || null
  }

  async createFromTemplate(templateId: string): Promise<FormSchema> {
    const template = this.getTemplate(templateId)
    if (!template) throw new Error(`Template ${templateId} not found`)

    const cloned = cloneSchemaWithNewIds(template.schema, template.name)
    return localFormRepository.create(cloned, "draft")
  }
}

export const templateRepository = new TemplateRepository()
