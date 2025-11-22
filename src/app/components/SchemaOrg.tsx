import { schemaOrganization, schemaLocalBusiness } from "@/lib/seo-schema";

/**
 * Компонент для внедрения Schema.org микроразметки
 */
interface SchemaProps {
  schema?: Record<string, any>;
}

export const SchemaOrg: React.FC<SchemaProps> = ({ schema }) => {
  const finalSchema = schema || schemaLocalBusiness;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalSchema) }}
    />
  );
};

export default SchemaOrg;
