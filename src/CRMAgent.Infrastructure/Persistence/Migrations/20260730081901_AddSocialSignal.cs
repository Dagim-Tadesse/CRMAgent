using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMAgent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialSignal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SocialSignals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlatformSource = table.Column<int>(type: "INTEGER", nullable: false),
                    SignalType = table.Column<int>(type: "INTEGER", nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: true),
                    AuthorName = table.Column<string>(type: "TEXT", nullable: false),
                    PostReference = table.Column<string>(type: "TEXT", nullable: false),
                    Sentiment = table.Column<int>(type: "INTEGER", nullable: false),
                    LeadId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SocialSignals", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SocialSignals");
        }
    }
}
