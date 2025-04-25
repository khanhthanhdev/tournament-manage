import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMatchDto, CreateAllianceDto } from './dto/create-match.dto';
import { UpdateMatchDto, UpdateAllianceDto, UpdateAllianceScoringDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(createMatchDto: CreateMatchDto) {
    const { alliances, ...matchData } = createMatchDto;

    // Create the match
    const match = await this.prisma.match.create({
      data: {
        matchNumber: matchData.matchNumber,
        status: matchData.status || 'PENDING',
        startTime: matchData.startTime ? new Date(matchData.startTime) : null,
        endTime: matchData.endTime ? new Date(matchData.endTime) : null,
        stageId: matchData.stageId,
      },
    });

    // If alliances are provided, create them
    if (alliances && alliances.length > 0) {
      for (const allianceData of alliances) {
        await this.createAlliance(match.id, allianceData);
      }
    }

    return this.findOne(match.id);
  }

  private async createAlliance(matchId: string, allianceData: CreateAllianceDto) {
    // Create the alliance
    const alliance = await this.prisma.alliance.create({
      data: {
        color: allianceData.color,
        matchId,
      },
    });

    // Create team alliances (connecting teams to this alliance)
    for (const teamId of allianceData.teamIds) {
      await this.prisma.teamAlliance.create({
        data: {
          teamId,
          allianceId: alliance.id,
        },
      });
    }

    // Create the alliance scoring record
    await this.prisma.allianceScoring.create({
      data: {
        allianceId: alliance.id,
      },
    });

    return alliance;
  }

  findAll() {
    return this.prisma.match.findMany({
      include: {
        stage: {
          include: {
            tournament: true,
          },
        },
        alliances: {
          include: {
            teamAlliances: {
              include: {
                team: true,
              },
            },
            allianceScoring: true,
          },
        },
        scoredBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.match.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            tournament: true,
          },
        },
        alliances: {
          include: {
            teamAlliances: {
              include: {
                team: true,
              },
            },
            allianceScoring: true,
          },
        },
        scoredBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  update(id: string, updateMatchDto: UpdateMatchDto) {
    const data: any = {};
    
    if (updateMatchDto.matchNumber !== undefined) {
      data.matchNumber = updateMatchDto.matchNumber;
    }
    
    if (updateMatchDto.status !== undefined) {
      data.status = updateMatchDto.status;
    }
    
    if (updateMatchDto.startTime) {
      data.startTime = updateMatchDto.startTime instanceof Date 
        ? updateMatchDto.startTime 
        : new Date(updateMatchDto.startTime);
    }
    
    if (updateMatchDto.endTime) {
      data.endTime = updateMatchDto.endTime instanceof Date 
        ? updateMatchDto.endTime 
        : new Date(updateMatchDto.endTime);
    }
    
    if (updateMatchDto.scoredById) {
      data.scoredById = updateMatchDto.scoredById;
    }
    
    return this.prisma.match.update({
      where: { id },
      data,
      include: {
        alliances: true,
      },
    });
  }

  async updateAlliance(id: string, updateAllianceDto: UpdateAllianceDto) {
    const data: any = {};
    
    if (updateAllianceDto.score !== undefined) {
      data.score = updateAllianceDto.score;
    }
    
    if (updateAllianceDto.color) {
      data.color = updateAllianceDto.color;
    }
    
    return this.prisma.alliance.update({
      where: { id },
      data,
    });
  }

  async updateAllianceScoring(
    id: string, 
    refereeId: string,
    updateAllianceScoringDto: UpdateAllianceScoringDto
  ) {
    const data: any = {
      refereeId,
    };
    
    if (updateAllianceScoringDto.scoreDetails) {
      data.scoreDetails = updateAllianceScoringDto.scoreDetails;
    }
    
    if (updateAllianceScoringDto.card) {
      data.card = updateAllianceScoringDto.card;
    }
    
    if (updateAllianceScoringDto.notes) {
      data.notes = updateAllianceScoringDto.notes;
    }
    
    return this.prisma.allianceScoring.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.match.delete({
      where: { id },
    });
  }
}