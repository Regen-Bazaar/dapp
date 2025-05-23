import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useWallet } from "../context/WalletContext";
import { depositVault } from "../lib/contracts/depositVault";
import { generateProfileImage } from "../lib/generateImage";
import { projectService } from "../lib/projectService";
import { FEATURES } from "../lib/config";

interface ImpactAction {
  title: string;
  achievedImpact: string;
  period: string;
  location: string;
}

const CreateNonProfitProfile = () => {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [devImageUrl, setDevImageUrl] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [formData, setFormData] = useState({
    organizationType: "Foundation",
    entityName: "",
    walletAddress: "",
    transactionHash: undefined as string | undefined,
  });

  const [impactActions, setImpactActions] = useState<ImpactAction[]>([
    {
      title: "",
      achievedImpact: "",
      period: "",
      location: "",
    },
  ]);

  const [proofOfImpact, setProofOfImpact] = useState("");
  const [technicalSkillLevel, setTechnicalSkillLevel] = useState("low");
  const [price, setPrice] = useState<string>('');
  const [impactValue, setImpactValue] = useState<number>(0);

  useEffect(() => {
    if (walletAddress) {
      setFormData((prev) => ({ ...prev, walletAddress }));
      console.log("Form updated with wallet address:", walletAddress);
    }
  }, [walletAddress]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImpactActionChange = (
    index: number,
    field: keyof ImpactAction,
    value: string
  ) => {
    const updatedActions = [...impactActions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setImpactActions(updatedActions);
  };

  const addImpactAction = () => {
    setImpactActions([
      ...impactActions,
      {
        title: "",
        achievedImpact: "",
        period: "",
        location: "",
      },
    ]);
  };

  const generateRandomValues = () => {
    const randomPrice = Number((Math.random() * (0.0009 - 0.0001) + 0.0001).toFixed(4));
    const randomImpact = Math.floor(Math.random() * 10) + 1;
    
    setPrice(randomPrice.toString());
    setImpactValue(randomImpact);
  };

  const generateImage = async () => {
    if (!FEATURES.IMAGE_GENERATION) {
      const defaultImage = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80";
      setGeneratedImageUrl(defaultImage);
      if (isDevelopment) {
        setDevImageUrl(defaultImage);
      }
      return;
    }

    setIsGeneratingImage(true);
    try {
      const description = `${formData.entityName} - ${impactActions
        .map(action => `${action.achievedImpact} through ${action.title} in ${action.location}`)
        .join(", ")}`;
      
      const imageUrl = await generateProfileImage(description);
      setGeneratedImageUrl(imageUrl);
      if (isDevelopment) {
        setDevImageUrl(imageUrl);
      }
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleTokenize = async () => {
    setIsProcessing(true);
    try {
      await generateImage();
      generateRandomValues();
      setCurrentStep(2);
    } catch (error) {
      console.error("Tokenize error:", error);
      toast.error("Failed to tokenize impact");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeploy = async () => {
    if (!generatedImageUrl) {
      toast.error("Please generate an image first");
      return;
    }

    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Attempting deposit with amount:", price);
      const tx = await depositVault.deposit(price);
      console.log("Transaction sent:", tx.hash);

      const receipt = await toast.promise(tx.wait(), {
        loading: "Confirming transaction...",
        success: "Deposit confirmed!",
        error: "Transaction failed",
      });

      setFormData((prev) => ({
        ...prev,
        transactionHash: receipt.hash,
      }));

      setCurrentStep(3);
    } catch (error: any) {
      console.error("Deploy error:", error);
      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user");
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds in wallet");
      } else {
        toast.error(error.message || "Failed to deploy");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('wallet_address', formData.walletAddress)
        .single();

      let orgId: string;

      if (existingOrg) {
        orgId = existingOrg.id;
        if (isDevelopment) {
          await supabase
            .from('organizations')
            .update({ development_image_url: devImageUrl })
            .eq('id', orgId);
        }
      } else {
        const baseUsername = formData.entityName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 10);
        const uniqueSuffix = formData.walletAddress.slice(2, 8).toLowerCase();
        const username = `${baseUsername}_${uniqueSuffix}`;

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.entityName,
            type: formData.organizationType,
            wallet_address: formData.walletAddress,
            logo_url: generatedImageUrl,
            development_image_url: isDevelopment ? devImageUrl : null,
            verified: false,
            username: username,
          })
          .select()
          .single();

        if (orgError) throw orgError;
        orgId = orgData.id;
      }

      for (const action of impactActions) {
        const { error: projectError } = await supabase
          .from('projects')
          .insert({
            title: action.title,
            description: `${action.achievedImpact} in ${action.location} during ${action.period}`,
            category: formData.organizationType,
            funding_goal: parseFloat(price),
            start_date: new Date().toISOString(),
            status: 'active',
            current_funding: 0,
            organization_id: orgId,
            wallet_address: formData.walletAddress,
            transaction_hash: formData.transactionHash || '',
          });

        if (projectError) {
          console.error('Project creation error:', projectError);
          throw new Error('Failed to create project');
        }
      }

      toast.success('Projects created successfully!');
      navigate('/projects');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to create projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-bold mb-12 text-[#B4F481]">
          TOKENIZE YOUR REAL-WORLD IMPACT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Impact Product Data Form */}
          <div className="bg-black/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">
              IMPACT PRODUCT DATA FORM
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400">
                  1. Organization Type
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded bg-gray-900 border-gray-700 text-white"
                >
                  <option value="Foundation">Foundation</option>
                  <option value="NGO">NGO</option>
                  <option value="Social Enterprise">Social Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400">
                  2. Entity Name
                </label>
                <input
                  type="text"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded bg-gray-900 border-gray-700 text-white"
                  placeholder="Your organization name"
                />
              </div>

              {impactActions.map((action, index) => (
                <div key={index} className="space-y-4">
                  <label className="block text-sm text-gray-400">
                    3. Action Taken #{index + 1}
                  </label>
                  <input
                    type="text"
                    value={action.title}
                    onChange={(e) =>
                      handleImpactActionChange(index, "title", e.target.value)
                    }
                    className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                    placeholder="Action title"
                  />
                  <div className="pl-4 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400">
                        3.1 Achieved Impact
                      </label>
                      <input
                        type="text"
                        value={action.achievedImpact}
                        onChange={(e) =>
                          handleImpactActionChange(
                            index,
                            "achievedImpact",
                            e.target.value
                          )
                        }
                        className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g., 10 trees planted"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">
                        3.2 Period
                      </label>
                      <input
                        type="text"
                        value={action.period}
                        onChange={(e) =>
                          handleImpactActionChange(
                            index,
                            "period",
                            e.target.value
                          )
                        }
                        className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                        placeholder="e.g., from 10.2023 to 10.2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">
                        3.3 Area of Impact
                      </label>
                      <input
                        type="text"
                        value={action.location}
                        onChange={(e) =>
                          handleImpactActionChange(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                        className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                        placeholder="Location"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addImpactAction}
                className="text-[#B4F481] hover:text-[#9FE070] text-sm"
              >
                + ADD ACTION
              </button>

              <div>
                <label className="block text-sm text-gray-400">
                  4. Link to Proof of Impact
                </label>
                <input
                  type="text"
                  value={proofOfImpact}
                  onChange={(e) => setProofOfImpact(e.target.value)}
                  className="mt-1 block w-full rounded bg-gray-900 border-gray-700 text-white"
                  placeholder="URL to proof"
                />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Does this action require specialized technical skills or
                  scientific knowledge?
                </p>
                <div className="flex space-x-4">
                  {["Low", "Medium", "High"].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setTechnicalSkillLevel(level.toLowerCase())
                      }
                      className={`px-4 py-1 rounded ${
                        technicalSkillLevel === level.toLowerCase()
                          ? "bg-[#B4F481] text-black"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTokenize}
              disabled={isProcessing}
              className="mt-8 w-full bg-[#B4F481] text-black py-2 rounded-md hover:bg-[#9FE070] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                "TOKENIZE"
              )}
            </button>
          </div>

          {/* Collection Preview */}
          <div className="bg-black/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">COLLECTION PREVIEW</h2>
            <div className="aspect-square bg-gray-900 rounded-lg mb-6 flex items-center justify-center relative">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated Impact"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-[#B4F481] text-lg">
                  {isGeneratingImage
                    ? "GENERATING..."
                    : FEATURES.IMAGE_GENERATION
                    ? "GENERATE"
                    : "PLACEHOLDER IMAGE"}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400">1. Price (ETH)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={price}
                    readOnly
                    className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                  />
                  <span className="text-gray-400">ETH</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400">
                  2. Impact value
                </label>
                <input
                  type="text"
                  className="block w-full rounded bg-gray-900 border-gray-700 text-white"
                  value={impactValue}
                  readOnly
                />
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={!generatedImageUrl || isProcessing || currentStep !== 2}
              className="mt-8 w-full bg-[#B4F481] text-black py-2 rounded-md hover:bg-[#9FE070] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                "CONFIRM AND DEPLOY"
              )}
            </button>
          </div>

          {/* List for Sale */}
          <div className="bg-black/50 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">LIST FOR SALE</h2>
            <p className="text-gray-400 mb-6">
              Open for public purchase on Regen Bazaar
            </p>

            <button
              onClick={handleSubmit}
              disabled={loading || currentStep !== 3}
              className="w-full bg-[#B4F481] text-black py-2 rounded-md hover:bg-[#9FE070] font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                "LIST"
              )}
            </button>

            <div className="mt-12">
              <h3 className="text-lg font-medium mb-4">
                Promote to your community and potential buyers
              </h3>
              <button
                className="w-full bg-[#B4F481] text-black py-2 rounded-md hover:bg-[#9FE070] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentStep !== 3}
              >
                SHARE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNonProfitProfile;