import { PrismaClient, Prisma } from "@/generated/prisma";
import TransmissionListClient from "./TransmissionListClient";

const prisma = new PrismaClient();

type TransmissionWithTags = Prisma.TransmissionGetPayload<{
  include: {
    transmissionTags: {
      include: {
        tag: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

interface TransmissionListProps {
  selectedDate?: { year: number; month: number; day: number };
}

export default async function TransmissionList({
  selectedDate,
}: TransmissionListProps) {
  let transmissions: TransmissionWithTags[] = [];

  if (selectedDate) {
    // Create date range for the selected day
    const startDate = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    const endDate = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day + 1
    );

    transmissions = await prisma.transmission.findMany({
      where: {
        publishedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        transmissionTags: {
          include: {
            tag: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
  }

  // Transform the data to match our component interface
  const transformedTransmissions = transmissions.map((transmission) => ({
    id: transmission.id,
    title: transmission.title,
    content: transmission.content || "",
    summary: transmission.subTitle,
    type: transmission.type as any,
    sourceAuthor: transmission.sourceAuthor,
    sourceUrl: transmission.sourceUrl,
    publishedAt: transmission.publishedAt?.toISOString() || "",
    tags: transmission.transmissionTags.map((tagRelation) => ({
      id: tagRelation.tag.id,
      name: tagRelation.tag.name,
      slug: tagRelation.tag.slug,
      color: tagRelation.tag.category.color,
    })),
  }));

  return (
    <TransmissionListClient
      transmissions={transformedTransmissions}
      selectedDate={selectedDate}
    />
  );
}
