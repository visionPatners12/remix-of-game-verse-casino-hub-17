
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui";
import { LogOut, User, HelpCircle, MessageSquare, Wallet, LayoutDashboard, History, Trophy, TrendingUp, Settings, Bell, Ticket, Copy, ShoppingCart, Shield, Receipt, RotateCcw, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsInGameRoom } from "@/hooks/room/useIsInGameRoom";
import { toast } from "sonner";
import { UserQuickMenu } from "./UserQuickMenu";
import { useState, useEffect } from "react";
import { Badge, ScrollArea, Card } from "@/ui";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useUserProfile } from "@/features/profile";
import { SoonOverlay } from "@/ui";

interface ProfileMenuProps {
  user: {
    name: string;
    avatar: string;
    balance?: {
      real: number;
      bonus: number;
    };
  };
  onLogout: () => void;
}

export const ProfileMenu = ({ user, onLogout }: ProfileMenuProps) => {
  const isInGameRoom = useIsInGameRoom();
  const { totalUnreadMessages } = useDirectMessages();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (user?.name) {
      localStorage.setItem("userName", user.name);
    }
  }, [user.name]);

  const handleDisabledClick = (e: React.MouseEvent) => {
    if (isInGameRoom) {
      e.preventDefault();
      toast.error("You must leave the game room first", {
        description: "Finish your game before navigating elsewhere."
      });
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full relative group"
          >
            <Avatar className="border-2 border-border/30 group-hover:border-primary/50 transition-all duration-300 shadow-lg shadow-black/20">
              <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}`} />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-white">
                {profile?.first_name?.slice(0, 1).toUpperCase()}{profile?.last_name?.slice(0, 1).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            
            {/* Status indicator */}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#0f1424]"></span>
            
            {/* Enhanced glow effect */}
            <span className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-all duration-300"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-96 bg-background/98 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/20 p-0 transition-all duration-200"
          sideOffset={12}
          alignOffset={4}
        >
          <ScrollArea className="max-h-[600px]">
            <div className="p-4 space-y-4">
              {/* Enhanced User Profile Header */}
              <Card className="p-4 bg-gradient-to-br from-card/50 to-card/30 border-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg">
                    <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-white font-semibold">
                      {profile?.first_name?.slice(0, 1).toUpperCase()}{profile?.last_name?.slice(0, 1).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{profile?.first_name} {profile?.last_name}</h3>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          if (profile?.username) {
                            navigator.clipboard.writeText(profile.username);
                            toast.success("Username copied!");
                          }
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                  </div>
                </div>
              </Card>

              {/* Balance & Quick Actions */}
              <Card className="p-4 bg-gradient-to-br from-card/50 to-card/30 border-border/30 backdrop-blur-sm">
                <Link to="/wallet" className="block">
                  <div className="flex items-center justify-between mb-3 group cursor-pointer hover:bg-muted/20 -m-2 p-2 rounded-md transition-colors">
                    <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
                    <div className="flex items-center gap-2">
                      {user.balance && (
                        <span className="text-lg font-bold text-foreground">
                          {user.balance.real + user.balance.bonus}€
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 mb-4">
                  <SoonOverlay enabled={true}>
                    <Button 
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary-hover shadow-sm shadow-primary/20 transition-all duration-300" 
                      disabled
                    >
                      Deposit
                    </Button>
                  </SoonOverlay>
                  <SoonOverlay enabled={true}>
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="flex-1 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300" 
                      disabled
                    >
                      Withdraw
                    </Button>
                  </SoonOverlay>
                </div>
                
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: ShoppingCart, label: "Buy", color: "text-accent", bg: "hover:bg-accent/10", soon: true },
                    { icon: Shield, label: "Vault Pro", color: "text-secondary", bg: "hover:bg-secondary/10", soon: true },
                    { icon: Receipt, label: "Transaction", color: "text-blue-500", bg: "hover:bg-blue-500/10", soon: true },
                    { icon: RotateCcw, label: "Rollover", color: "text-amber-500", bg: "hover:bg-amber-500/10", soon: true },
                    { icon: History, label: "My Bets", color: "text-green-500", bg: "hover:bg-green-500/10", soon: true, action: "/my-bets" }
                  ].map((item, index) => (
                    <SoonOverlay key={index} enabled={item.soon}>
                      <Link to={item.action || "#"} className={item.soon ? "pointer-events-none" : ""}>
                        <button
                          className={`flex flex-col items-center justify-center p-2 rounded-md transition-all duration-300 transform hover:scale-105 ${item.bg} group w-full`}
                          disabled={item.soon}
                        >
                          <item.icon className={`h-4 w-4 mb-1 transition-colors duration-300 ${item.color}`} />
                          <span className="text-xs text-center font-medium text-foreground group-hover:text-foreground/80 transition-colors duration-300">
                            {item.label}
                          </span>
                        </button>
                      </Link>
                    </SoonOverlay>
                  ))}
                </div>
              </Card>
          
              {isInGameRoom ? (
                <div className="p-4">
                  <div className="text-center text-muted-foreground">
                    <p className="mb-2">You are currently in a game room</p>
                    <p className="text-sm">Finish your game before accessing menu options</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Navigation Sections */}
                  <div className="space-y-3">
                    {/* Profile & Dashboard Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Profile & Dashboard</h4>
                      <div className="space-y-1">
                        <Link to="/profile" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">My Profile</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Betting Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Betting</h4>
                      <div className="space-y-1">
                        <Link to="/mes-paris" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <Ticket className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-foreground">Bet</span>
                            <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                        </Link>
                        <Link to="/performances" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-foreground">My Performance</span>
                          </div>
                        </Link>
                        <Link to="/achievements" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-foreground">Achievements</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Financial Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Financial</h4>
                      <div className="space-y-1">
                        <Link to="/wallet" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">My Wallet</span>
                            {user.balance && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {user.balance.real + user.balance.bonus}€
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Social Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Social</h4>
                      <div className="space-y-1">
                        <Link to="/friends" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">Friends & Messages</span>
                            {totalUnreadMessages > 0 && (
                              <Badge className="ml-auto bg-primary text-primary-foreground text-xs">
                                {totalUnreadMessages}
                              </Badge>
                            )}
                          </div>
                        </Link>
                        <Link to="/notifications" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <Bell className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">Notifications</span>
                            <Badge className="ml-auto bg-destructive/20 text-destructive text-xs">3</Badge>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Settings & Support Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Settings & Support</h4>
                      <div className="space-y-1">
                        <Link to="/settings" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <Settings className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">Settings</span>
                          </div>
                        </Link>
                        <Link to="/support" className="block">
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">Support</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Logout Section */}
              <div className="border-t border-border/30 pt-2 mt-4">
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
