import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMatchScoresDto, UpdateMatchScoresDto } from './dto';

@Injectable()
export class MatchScoresService {
  constructor(private prisma: PrismaService) {}

  async create(createMatchScoresDto: CreateMatchScoresDto) {
    // Check if match exists
    const match = await this.prisma.match.findUnique({
      where: { id: createMatchScoresDto.matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${createMatchScoresDto.matchId} not found`);
    }

    // Apply team count multipliers if not explicitly provided
    if (createMatchScoresDto.redTeamCount && !createMatchScoresDto.redMultiplier) {
      createMatchScoresDto.redMultiplier = this.calculateMultiplier(createMatchScoresDto.redTeamCount);
    }

    if (createMatchScoresDto.blueTeamCount && !createMatchScoresDto.blueMultiplier) {
      createMatchScoresDto.blueMultiplier = this.calculateMultiplier(createMatchScoresDto.blueTeamCount);
    }

    // Create match scores
    return this.prisma.matchScores.create({
      data: {
        match: { connect: { id: createMatchScoresDto.matchId } },
        redAutoScore: createMatchScoresDto.redAutoScore || 0,
        redDriveScore: createMatchScoresDto.redDriveScore || 0,
        redTotalScore: createMatchScoresDto.redTotalScore || 0,
        blueAutoScore: createMatchScoresDto.blueAutoScore || 0,
        blueDriveScore: createMatchScoresDto.blueDriveScore || 0,
        blueTotalScore: createMatchScoresDto.blueTotalScore || 0,
        redTeamCount: createMatchScoresDto.redTeamCount || 0,
        redMultiplier: createMatchScoresDto.redMultiplier || 1.0,
        blueTeamCount: createMatchScoresDto.blueTeamCount || 0,
        blueMultiplier: createMatchScoresDto.blueMultiplier || 1.0,
        redGameElements: createMatchScoresDto.redGameElements ? JSON.stringify(createMatchScoresDto.redGameElements) : undefined,
        blueGameElements: createMatchScoresDto.blueGameElements ? JSON.stringify(createMatchScoresDto.blueGameElements) : undefined,
        scoreDetails: createMatchScoresDto.scoreDetails ? JSON.stringify(createMatchScoresDto.scoreDetails) : undefined,
      },
    });
  }

  async findAll() {
    const scores = await this.prisma.matchScores.findMany({
      include: {
        match: {
          select: {
            id: true,
            matchNumber: true,
            status: true,
            stage: {
              select: {
                name: true,
                tournament: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Parse JSON fields
    return scores.map(score => ({
      ...score,
      redGameElements: score.redGameElements ? JSON.parse(String(score.redGameElements)) : null,
      blueGameElements: score.blueGameElements ? JSON.parse(String(score.blueGameElements)) : null,
      scoreDetails: score.scoreDetails ? JSON.parse(String(score.scoreDetails)) : null,
    }));
  }

  async findOne(id: string) {
    const score = await this.prisma.matchScores.findUnique({
      where: { id },
      include: {
        match: {
          include: {
            alliances: {
              include: {
                teamAlliances: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!score) {
      throw new NotFoundException(`Match scores with ID ${id} not found`);
    }

    // Parse JSON fields
    return {
      ...score,
      redGameElements: score.redGameElements ? JSON.parse(String(score.redGameElements)) : null,
      blueGameElements: score.blueGameElements ? JSON.parse(String(score.blueGameElements)) : null,
      scoreDetails: score.scoreDetails ? JSON.parse(String(score.scoreDetails)) : null,
    };
  }

  async findByMatchId(matchId: string) {
    const score = await this.prisma.matchScores.findUnique({
      where: { matchId },
      include: {
        match: {
          include: {
            alliances: {
              include: {
                teamAlliances: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!score) {
      throw new NotFoundException(`Match scores for match ID ${matchId} not found`);
    }

    // Parse JSON fields
    return {
      ...score,
      redGameElements: score.redGameElements ? JSON.parse(String(score.redGameElements)) : null,
      blueGameElements: score.blueGameElements ? JSON.parse(String(score.blueGameElements)) : null,
      scoreDetails: score.scoreDetails ? JSON.parse(String(score.scoreDetails)) : null,
    };
  }

  async update(id: string, updateMatchScoresDto: UpdateMatchScoresDto) {
    // Check if match scores exist
    const existingScores = await this.prisma.matchScores.findUnique({
      where: { id },
    });

    if (!existingScores) {
      throw new NotFoundException(`Match scores with ID ${id} not found`);
    }

    // Apply team count multipliers if needed
    if (updateMatchScoresDto.redTeamCount && !updateMatchScoresDto.redMultiplier) {
      updateMatchScoresDto.redMultiplier = this.calculateMultiplier(updateMatchScoresDto.redTeamCount);
    }

    if (updateMatchScoresDto.blueTeamCount && !updateMatchScoresDto.blueMultiplier) {
      updateMatchScoresDto.blueMultiplier = this.calculateMultiplier(updateMatchScoresDto.blueTeamCount);
    }

    const updateData: any = { ...updateMatchScoresDto };
    
    // Remove matchId as it can't be updated
    if (updateData.matchId) delete updateData.matchId;
    
    // Convert objects to JSON strings
    if (updateData.redGameElements) {
      updateData.redGameElements = JSON.stringify(updateData.redGameElements);
    }
    
    if (updateData.blueGameElements) {
      updateData.blueGameElements = JSON.stringify(updateData.blueGameElements);
    }
    
    if (updateData.scoreDetails) {
      updateData.scoreDetails = JSON.stringify(updateData.scoreDetails);
    }

    return this.prisma.matchScores.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // Check if match scores exist
    const existingScores = await this.prisma.matchScores.findUnique({
      where: { id },
    });

    if (!existingScores) {
      throw new NotFoundException(`Match scores with ID ${id} not found`);
    }

    return this.prisma.matchScores.delete({
      where: { id },
    });
  }

  // Helper method to calculate multiplier based on team count
  private calculateMultiplier(teamCount: number): number {
    switch (teamCount) {
      case 1: return 1.25;
      case 2: return 1.5;
      case 3: return 1.75;
      case 4: return 2.0;
      default: return 1.0;
    }
  }
}