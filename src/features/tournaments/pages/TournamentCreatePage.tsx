import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BracketSizeSelector } from '../components/BracketSizeSelector';
import { EntryFeeInput } from '../components/EntryFeeInput';
import { PrizePoolPreview } from '../components/PrizePoolPreview';
import { SchedulePicker } from '../components/SchedulePicker';
import { LudoSettingsCard } from '../components/LudoSettingsCard';
import { TournamentSummary } from '../components/TournamentSummary';
import { TournamentFormData, DEFAULT_FORM_DATA } from '../types';

const TournamentCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TournamentFormData>(DEFAULT_FORM_DATA);

  const updateForm = <K extends keyof TournamentFormData>(
    key: K, 
    value: TournamentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = () => {
    // Static for now - will add API call later
    console.log('Creating tournament:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/30">
        <nav className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">New Tournament</h1>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </nav>
      </header>

      {/* Content */}
      <main className="px-4 py-6 pb-32 space-y-6 max-w-lg mx-auto">
        
        {/* Basic Info Section */}
        <section className="bg-muted/20 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Basic Info</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Tournament Name</label>
            <Input
              placeholder="e.g. Ludo Championship"
              value={formData.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className="h-12 bg-muted/30 border-0 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Description (optional)</label>
            <Textarea
              placeholder="Tell players what makes this tournament special..."
              value={formData.description}
              onChange={(e) => updateForm('description', e.target.value)}
              className="min-h-[80px] bg-muted/30 border-0 rounded-xl resize-none"
            />
          </div>
        </section>

        {/* Bracket Size Section */}
        <section className="bg-muted/20 rounded-xl p-4">
          <BracketSizeSelector
            value={formData.bracketSize}
            onChange={(size) => updateForm('bracketSize', size)}
          />
        </section>

        {/* Entry Fee & Prizes Section */}
        <section className="bg-muted/20 rounded-xl p-4 space-y-4">
          <EntryFeeInput
            value={formData.entryFee}
            onChange={(value) => updateForm('entryFee', value)}
          />
          
          <PrizePoolPreview
            entryFee={formData.entryFee}
            bracketSize={formData.bracketSize}
            commissionRate={formData.commissionRate}
          />
        </section>

        {/* Schedule Section */}
        <section className="bg-muted/20 rounded-xl p-4">
          <SchedulePicker
            registrationStart={formData.registrationStart}
            registrationEnd={formData.registrationEnd}
            tournamentStart={formData.tournamentStart}
            startWhenFull={formData.startWhenFull}
            onRegistrationStartChange={(date) => updateForm('registrationStart', date)}
            onRegistrationEndChange={(date) => updateForm('registrationEnd', date)}
            onTournamentStartChange={(date) => updateForm('tournamentStart', date)}
            onStartWhenFullChange={(value) => updateForm('startWhenFull', value)}
          />
        </section>

        {/* Ludo Settings Section */}
        <section className="bg-muted/20 rounded-xl p-4">
          <LudoSettingsCard
            extraTurnOnSix={formData.extraTurnOnSix}
            betPerMatch={formData.betPerMatch}
            onExtraTurnChange={(value) => updateForm('extraTurnOnSix', value)}
            onBetPerMatchChange={(value) => updateForm('betPerMatch', value)}
          />
        </section>

        {/* Summary */}
        <TournamentSummary formData={formData} />

      </main>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/30">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleCreate}
            disabled={!formData.name.trim()}
            className="w-full h-14 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90"
          >
            <Trophy className="h-5 w-5 mr-2" />
            Create Tournament
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TournamentCreatePage;
