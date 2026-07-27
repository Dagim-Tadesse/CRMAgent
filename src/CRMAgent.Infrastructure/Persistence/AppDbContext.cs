using CRMAgent.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CRMAgent.Infrastructure.Persistence;

// IdentityDbContext gives us the AspNetUsers and AspNetRoles tables automatically
public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Each DbSet = one database table
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<EmailDraft> EmailDrafts => Set<EmailDraft>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // MUST call base — sets up Identity tables

        // Lead configuration
        builder.Entity<Lead>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).ValueGeneratedOnAdd();
            e.HasIndex(l => l.Email).IsUnique(); // Email must be unique
            e.Property(l => l.FullName).IsRequired().HasMaxLength(200);
            e.Property(l => l.Email).IsRequired().HasMaxLength(200);
            e.Property(l => l.Company).HasMaxLength(200);
            e.Property(l => l.RawInquiryText).IsRequired().HasMaxLength(5000);
            e.Property(l => l.TelegramUsername).HasMaxLength(100);
            // Store enums as strings in DB for readability
            e.Property(l => l.PipelineStage).HasConversion<string>();
            e.Property(l => l.Emotion).HasConversion<string>();
            e.Property(l => l.Status).HasConversion<string>();
        });

        // Interaction configuration
        builder.Entity<Interaction>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Content).IsRequired();
            e.Property(i => i.Channel).HasConversion<string>();
            e.Property(i => i.Type).HasConversion<string>();
            e.Property(i => i.Direction).HasConversion<string>();
            e.Property(i => i.Emotion).HasConversion<string>();
            // FK relationship: Interaction belongs to Lead, cascade delete
            e.HasOne(i => i.Lead)
             .WithMany(l => l.Interactions)
             .HasForeignKey(i => i.LeadId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // EmailDraft configuration
        builder.Entity<EmailDraft>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Subject).HasMaxLength(100);
            e.Property(d => d.Status).HasConversion<string>();
            e.HasOne(d => d.Lead)
             .WithMany(l => l.EmailDrafts)
             .HasForeignKey(d => d.LeadId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ActivityLog configuration
        builder.Entity<ActivityLog>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.TriggeredBy).HasConversion<string>();
            // Nullable FK — not all logs link to a lead
            e.HasOne(a => a.Lead)
             .WithMany(l => l.ActivityLogs)
             .HasForeignKey(a => a.LeadId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}